import TransactionsController from "#/controller/transactions/index";
import {
  userStatQueryPayload,
  type spendEnergyProps,
  type userStatsExtendedQueryPayload,
  type userStatsQueryPayload,
} from "#/controller/userStat/userStat.schema";
import type { Prisma } from "#/generated/prisma/client";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export default class UserStatController {
  private data: userStatsQueryPayload;
  static readonly MAX_ENERGY = 5;
  static readonly ENERGY_REGEN_RATE = 10;

  constructor(data: userStatsQueryPayload) {
    this.data = data;
  }

  get JSON(): userStatsExtendedQueryPayload {
    const shouldRegenerate = this.data.energy < UserStatController.MAX_ENERGY;
    const healthLeft = UserStatController.MAX_ENERGY - this.data.energy;
    const willRegenerateAt = shouldRegenerate
      ? new Date(
          this.data.energyUpdatedAt.getTime() +
            healthLeft * UserStatController.ENERGY_REGEN_RATE * 60 * 1000,
        )
      : undefined;

    const data = {
      ...this.data,
      willRegenerateAt,
    };
    return data;
  }

  async spendEnergy({ amount = 1, reason }: spendEnergyProps): Promise<void> {
    await db.$transaction(async (tx) => {
      const currentEnergy = await this.calculateCurrentEnergy(tx);

      if (currentEnergy < amount || amount <= 0) {
        throw new UserError(403, "Not enough energy to perform this action.");
      }

      const wasFull = currentEnergy === UserStatController.MAX_ENERGY;
      this.data.energy -= amount;

      if (wasFull) this.data.energyUpdatedAt = new Date();

      const result = await tx.userStat
        .update({
          where: { userID: this.data.userID, energy: { gte: amount } },
          data: {
            energy: { decrement: amount },
            energyUpdatedAt: wasFull ? this.data.energyUpdatedAt : undefined,
          },
        })
        .catch((error) => {
          if (error instanceof PrismaClientKnownRequestError) {
            throw new UserError(403, "Not enough energy to perform this action.");
          }
          throw error;
        });

      await TransactionsController.createTransaction(tx, {
        userID: this.data.userID,
        type: "ENERGY",
        amount: -amount,
        afterAmount: result.energy,
        reason: reason || "No reason provided",
      });
    });
  }

  private async calculateCurrentEnergy(tx: Prisma.TransactionClient): Promise<number> {
    const rows = await tx.$queryRaw<
      {
        energy: number;
        energyUpdatedAt: Date;
      }[]
    >`
				SELECT energy, "energyUpdatedAt"
				FROM "UserStat"
				WHERE "userID" = ${this.data.userID}
				FOR UPDATE
			`; // Lock the row for update to prevent race conditions

    const [row] = rows;
    if (!row) {
      throw new UserError(404, "User stats not found.");
    }

    const { energy, energyUpdatedAt } = row;

    if (energy >= UserStatController.MAX_ENERGY) {
      // If the user is already at max energy, we don't need to calculate regeneration
      this.data.energy = energy;
      this.data.energyUpdatedAt = energyUpdatedAt;
      return energy;
    }

    const now = new Date();
    const elapsedTime = (now.getTime() - energyUpdatedAt.getTime()) / 1000; // in seconds
    const regenRateInSeconds = UserStatController.ENERGY_REGEN_RATE * 60; // convert minutes to seconds
    const ticks = Math.floor(elapsedTime * (1 / regenRateInSeconds)); // energy regenerated since last update
    if (ticks <= 0) {
      this.data.energy = energy;
      this.data.energyUpdatedAt = energyUpdatedAt;
      return energy;
    }

    const incrementBy = Math.min(ticks, UserStatController.MAX_ENERGY - energy);
    const newEnergy = Math.min(energy + incrementBy, UserStatController.MAX_ENERGY);
    const newEnergyUpdatedAt = new Date(
      energyUpdatedAt.getTime() + ticks * regenRateInSeconds * 1000,
    ); // update the last updated time based on regenerated energy

    this.data.energy = newEnergy;
    this.data.energyUpdatedAt = newEnergyUpdatedAt;

    await tx.userStat.update({
      where: { userID: this.data.userID },
      data: {
        energy: {
          increment: incrementBy,
        },
        energyUpdatedAt: newEnergyUpdatedAt,
      },
    });

    return newEnergy;
  }

  private static async prepareData(data: userStatsQueryPayload): Promise<UserStatController> {
    const controller = new UserStatController(data);
    await db.$transaction((tx) => controller.calculateCurrentEnergy(tx));

    return controller;
  }

  static async getByUserId(userID: string): Promise<UserStatController> {
    const userStat = await db.userStat.findUnique({
      where: { userID },
      select: userStatQueryPayload,
    });

    if (!userStat) {
      // create if not exists
      const data = await db.userStat.create({
        data: { userID, energy: UserStatController.MAX_ENERGY, energyUpdatedAt: new Date() },
      });
      return await UserStatController.prepareData(data);
    }

    return await UserStatController.prepareData(userStat);
  }
}
