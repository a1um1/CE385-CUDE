import TransactionsController from "#/controller/transactions";
import type { UserStat } from "#/generated/prisma/client";
import { db } from "#/lib/prisma";
import UserError from "#/lib/router/http/userError";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

const MAX_ENERGY = 5;
const ENERGY_REGEN_RATE = 10; // energy per minute

export default class UserStatController {
  private data: UserStat;

  constructor(data: UserStat) {
    this.data = data;
  }

  get JSON() {
    return this.data;
  }

  async spendEnergy(amount = 1): Promise<void> {
    const currentEnergy = await this.calculateCurrentEnergy();

    if (currentEnergy < amount) {
      throw new UserError(403, "Not enough energy to perform this action.");
    }

    const wasFull = currentEnergy === MAX_ENERGY;
    this.data.energy -= amount;

    if (wasFull) this.data.energyUpdatedAt = new Date();

    await db.$transaction(async (tx) => {
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
        reason: "Spent energy",
      });
    });
  }

  private async calculateCurrentEnergy(): Promise<number> {
    const { energy, energyUpdatedAt } = this.data;
    if (!energyUpdatedAt) return energy;
    if (energy >= MAX_ENERGY) {
      // If the user is already at max energy, we don't need to calculate regeneration
      return energy;
    }
    const now = new Date();
    const elapsedTime = (now.getTime() - energyUpdatedAt.getTime()) / 1000; // in seconds
    const ticks = Math.floor(elapsedTime * (1 / ENERGY_REGEN_RATE)); // energy regenerated since last update
    if (ticks <= 0) return energy;

    this.data.energy = Math.min(energy + ticks, MAX_ENERGY);
    this.data.energyUpdatedAt = new Date(
      energyUpdatedAt.getTime() + ticks * ENERGY_REGEN_RATE * 1000,
    ); // update the last updated time based on regenerated energy

    await db.userStat.update({
      where: { userID: this.data.userID },
      data: {
        energy: this.data.energy,
        energyUpdatedAt: this.data.energyUpdatedAt,
      },
    });

    return this.data.energy;
  }

  private static async prepareData(data: UserStat): Promise<UserStatController> {
    const controller = new UserStatController(data);
    await controller.calculateCurrentEnergy();

    return controller;
  }

  static async getByUserId(userID: string): Promise<UserStatController> {
    const userStat = await db.userStat.findUnique({
      where: { userID },
    });

    if (!userStat) {
      // create if not exists
      const data = await db.userStat.create({
        data: { userID },
      });
      return await UserStatController.prepareData(data);
    }

    return await UserStatController.prepareData(userStat);
  }
}
