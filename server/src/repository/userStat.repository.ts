import { client, type Db } from "#/repository/client";
import { userStatQueryPayload } from "#/service/userStat/userStat.schema";

interface EnergyRow {
  energy: number;
  energyUpdatedAt: Date;
}

export interface UserSubmissionCalendarData {
  maxCount: number;
  dailyCounts: Record<string, number>;
  percentages: Record<string, number>;
}

export const userStatRepository = {
  findByUserID: (userID: string, tx?: Db) =>
    client(tx).userStat.findUnique({
      where: { userID },
      select: userStatQueryPayload,
    }),

  create: (userID: string, energy: number, tx?: Db) =>
    client(tx).userStat.create({
      data: { userID, energy, energyUpdatedAt: new Date() },
    }),

  /** `SELECT … FOR UPDATE`: holds the row until the transaction commits. */
  lockEnergy: (userID: string, tx: Db) =>
    tx.$queryRaw<EnergyRow[]>`
			SELECT energy, "energyUpdatedAt"
			FROM "UserStat"
			WHERE "userID" = ${userID}
			FOR UPDATE
		`,

  decrementEnergy: (userID: string, amount: number, energyUpdatedAt: Date | undefined, tx: Db) =>
    client(tx).userStat.update({
      where: { userID, energy: { gte: amount } },
      data: { energy: { decrement: amount }, energyUpdatedAt },
    }),

  incrementEnergy: (userID: string, incrementBy: number, energyUpdatedAt: Date, tx: Db) =>
    client(tx).userStat.update({
      where: { userID },
      data: { energy: { increment: incrementBy }, energyUpdatedAt },
    }),

  upsertReward: (
    props: { userID: string; xp: number; gems: number; initialEnergy: number },
    tx: Db,
  ) =>
    client(tx).userStat.upsert({
      where: { userID: props.userID },
      // The row is normally created by `getByUserId` at full energy; the column default would give
      // a brand-new student 0 energy, so set it here too.
      create: {
        userID: props.userID,
        energy: props.initialEnergy,
        energyUpdatedAt: new Date(),
        totalXP: props.xp,
        currentGems: props.gems,
      },
      update: {
        totalXP: { increment: props.xp },
        currentGems: { increment: props.gems },
      },
    }),

  async findSubmissionCalendarData(
    userID: string,
    startDate: Date,
    endDate: Date = new Date(),
  ): Promise<UserSubmissionCalendarData> {
    const submissions = await client().$queryRaw<{ date: string; count: number }[]>`
			SELECT DATE("createdAt")::text AS date, COUNT(*)::int AS count
			FROM "Sessions"
			WHERE "userID" = ${userID} AND "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
			GROUP BY date
			ORDER BY date ASC
		`;

    let maxCount = 0;
    const dailyCounts = (submissions || []).reduce(
      (acc, submission) => {
        acc[submission.date] = submission.count;
        if (submission.count > maxCount) maxCount = submission.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const percentages = Object.fromEntries(
      Object.entries(dailyCounts).map(([date, count]) => [
        date,
        Math.floor((maxCount > 0 ? count / maxCount : 0) * 100) / 100,
      ]),
    );

    return {
      maxCount,
      dailyCounts,
      percentages,
    };
  },
};
