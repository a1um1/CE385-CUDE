import TransactionsService from "#/service/transactions/index";
import {
  type spendEnergyProps,
  type userStatsExtendedQueryPayload,
  type userStatsQueryPayload,
} from "#/service/userStat/userStat.schema";
import type { Prisma } from "#/generated/prisma/client";
import UserError from "#/lib/router/http/userError";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { transaction } from "#/repository/client";
import { userStatRepository } from "#/repository/userStat.repository";

export default class UserStatService {
  private data: userStatsQueryPayload;
  static readonly MAX_ENERGY = 5;
  static readonly ENERGY_REGEN_RATE = 10;
  static readonly XP_LEVEL_BASE = 42;
  static readonly XP_LEVEL_EXPONENT = 1.67;

  constructor(data: userStatsQueryPayload) {
    this.data = data;
  }

  /** Total XP needed to reach `level`: round of `base * level ^ exponent`. */
  static xpForLevel(level: number): number {
    return Math.round(UserStatService.XP_LEVEL_BASE * level ** UserStatService.XP_LEVEL_EXPONENT);
  }

  /** Highest level whose XP requirement `totalXP` meets. Inverse of `xpForLevel`. */
  static levelByXp(totalXP: number): number {
    if (totalXP <= 0) return 0;
    const raw =
      (totalXP / UserStatService.XP_LEVEL_BASE) ** (1 / UserStatService.XP_LEVEL_EXPONENT);
    let level = Math.floor(raw);
    // Nudge off floating-point error at exact level boundaries.
    while (UserStatService.xpForLevel(level + 1) <= totalXP) level++;
    while (level > 0 && UserStatService.xpForLevel(level) > totalXP) level--;
    return level;
  }

  /** Level plus progress inside it: XP earned this level, XP left to level up, and percent. */
  static progressByXp(totalXP: number): {
    level: number;
    xpIntoLevel: number;
    xpToNextLevel: number;
    levelProgressPercent: number;
  } {
    const level = UserStatService.levelByXp(totalXP);
    const levelStart = UserStatService.xpForLevel(level);
    const nextLevel = UserStatService.xpForLevel(level + 1);
    const xpIntoLevel = totalXP - levelStart;
    const percent = (xpIntoLevel / (nextLevel - levelStart)) * 100;
    return {
      level,
      xpIntoLevel,
      xpToNextLevel: nextLevel - totalXP,
      levelProgressPercent: Math.round(percent * 100) / 100,
    };
  }

  get JSON(): userStatsExtendedQueryPayload {
    const shouldRegenerate = this.data.energy < UserStatService.MAX_ENERGY;
    const healthLeft = UserStatService.MAX_ENERGY - this.data.energy;
    const willRegenerateAt = shouldRegenerate
      ? new Date(
          this.data.energyUpdatedAt.getTime() +
            healthLeft * UserStatService.ENERGY_REGEN_RATE * 60 * 1000,
        )
      : undefined;

    const data = {
      ...this.data,
      ...UserStatService.progressByXp(this.data.totalXP),
      willRegenerateAt,
    };
    return data;
  }

  async spendEnergy({ amount = 1, reason }: spendEnergyProps): Promise<void> {
    await transaction(async (tx) => {
      const currentEnergy = await this.calculateCurrentEnergy(tx);

      if (currentEnergy < amount || amount <= 0) {
        throw new UserError(403, "Not enough energy to perform this action.");
      }

      const wasFull = currentEnergy === UserStatService.MAX_ENERGY;
      this.data.energy -= amount;

      if (wasFull) this.data.energyUpdatedAt = new Date();

      const result = await userStatRepository
        .decrementEnergy(
          this.data.userID,
          amount,
          wasFull ? this.data.energyUpdatedAt : undefined,
          tx,
        )
        .catch((error) => {
          if (error instanceof PrismaClientKnownRequestError) {
            throw new UserError(403, "Not enough energy to perform this action.");
          }
          throw error;
        });

      await TransactionsService.createTransaction(tx, {
        userID: this.data.userID,
        type: "ENERGY",
        amount: -amount,
        afterAmount: result.energy,
        reason: reason || "No reason provided",
      });
    });
  }

  /**
   * Credit XP and/or gems and log one `Transactions` row per currency moved. The caller owns the
   * transaction, so the grant commits together with whatever earned it.
   */
  static async grantReward(
    tx: Prisma.TransactionClient,
    props: { userID: string; xp: number; gems: number; reason: string },
  ): Promise<void> {
    if (props.xp === 0 && props.gems === 0) return;

    const stat = await userStatRepository.upsertReward(
      {
        userID: props.userID,
        xp: props.xp,
        gems: props.gems,
        initialEnergy: UserStatService.MAX_ENERGY,
      },
      tx,
    );

    if (props.xp !== 0) {
      await TransactionsService.createTransaction(tx, {
        userID: props.userID,
        type: "XP",
        amount: props.xp,
        afterAmount: stat.totalXP,
        reason: props.reason,
      });
    }
    if (props.gems !== 0) {
      await TransactionsService.createTransaction(tx, {
        userID: props.userID,
        type: "GEM",
        amount: props.gems,
        afterAmount: stat.currentGems,
        reason: props.reason,
      });
    }
  }

  private async calculateCurrentEnergy(tx: Prisma.TransactionClient): Promise<number> {
    const rows = await userStatRepository.lockEnergy(this.data.userID, tx);

    const [row] = rows;
    if (!row) {
      throw new UserError(404, "User stats not found.");
    }

    const { energy, energyUpdatedAt } = row;

    if (energy >= UserStatService.MAX_ENERGY) {
      // If the user is already at max energy, we don't need to calculate regeneration
      this.data.energy = energy;
      this.data.energyUpdatedAt = energyUpdatedAt;
      return energy;
    }

    const now = new Date();
    const elapsedTime = (now.getTime() - energyUpdatedAt.getTime()) / 1000; // in seconds
    const regenRateInSeconds = UserStatService.ENERGY_REGEN_RATE * 60; // convert minutes to seconds
    const ticks = Math.floor(elapsedTime * (1 / regenRateInSeconds)); // energy regenerated since last update
    if (ticks <= 0) {
      this.data.energy = energy;
      this.data.energyUpdatedAt = energyUpdatedAt;
      return energy;
    }

    const incrementBy = Math.min(ticks, UserStatService.MAX_ENERGY - energy);
    const newEnergy = Math.min(energy + incrementBy, UserStatService.MAX_ENERGY);
    const newEnergyUpdatedAt = new Date(
      energyUpdatedAt.getTime() + ticks * regenRateInSeconds * 1000,
    ); // update the last updated time based on regenerated energy

    this.data.energy = newEnergy;
    this.data.energyUpdatedAt = newEnergyUpdatedAt;

    await userStatRepository.incrementEnergy(this.data.userID, incrementBy, newEnergyUpdatedAt, tx);

    return newEnergy;
  }

  private static async prepareData(data: userStatsQueryPayload): Promise<UserStatService> {
    const service = new UserStatService(data);
    await transaction((tx) => service.calculateCurrentEnergy(tx));

    return service;
  }

  static async getByUserId(userID: string): Promise<UserStatService> {
    const userStat = await userStatRepository.findByUserID(userID);

    if (!userStat) {
      // create if not exists
      const data = await userStatRepository.create(userID, UserStatService.MAX_ENERGY);
      return await UserStatService.prepareData(data);
    }

    return await UserStatService.prepareData(userStat);
  }
}
