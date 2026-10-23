import type { Prisma } from "#/generated/prisma/client";
import { client, type Db } from "#/repository/client";
import type { CourseData } from "#/service/course/course.schema";
import { courseIncludes } from "#/service/course/course.schema";
import type { AdminCourseSchema } from "#/service/admin/courses/courses.schema";
import { courseQueryPayload } from "#/service/admin/courses/courses.schema";
import { resolveInclude } from "#/lib/include";

export const courseRepository = {
  findById: async (id: string, include?: string | string[]): Promise<CourseData | null> =>
    (await client().course.findUnique({
      where: { id },
      include: resolveInclude<Prisma.CourseInclude>(include, courseIncludes),
    })) as CourseData | null,

  findAll: async (include?: string | string[]): Promise<CourseData[]> =>
    (await client().course.findMany({
      include: resolveInclude<Prisma.CourseInclude>(include, courseIncludes),
      orderBy: [{ position: "asc" }, { id: "asc" }],
    })) as CourseData[],

  findPage: (args: {
    take: number;
    skip: number;
    cursor?: { id: string };
    orderBy: Prisma.CourseOrderByWithRelationInput | Prisma.CourseOrderByWithRelationInput[];
  }): Promise<AdminCourseSchema[]> =>
    client().course.findMany({
      take: args.take,
      skip: args.skip,
      cursor: args.cursor,
      orderBy: args.orderBy,
      select: courseQueryPayload,
    }),

  maxPosition: () => client().course.aggregate({ _max: { position: true } }),

  create: (data: Prisma.CourseUncheckedCreateInput, tx?: Db) => client(tx).course.create({ data }),

  update: (id: string, data: Prisma.CourseUpdateInput, tx?: Db) =>
    client(tx).course.update({ where: { id }, data }),
};
