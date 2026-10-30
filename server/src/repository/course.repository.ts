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

  findPage: async (args: {
    take: number;
    skip: number;
    cursor?: { id: string };
    orderBy: Prisma.CourseOrderByWithRelationInput | Prisma.CourseOrderByWithRelationInput[];
    where?: Prisma.CourseWhereInput;
  }): Promise<AdminCourseSchema[]> =>
    (await client().course.findMany({
      take: args.take,
      skip: args.skip,
      cursor: args.cursor,
      orderBy: args.orderBy,
      select: courseQueryPayload,
      where: args.where,
    })) as AdminCourseSchema[],

  maxPosition: () => client().course.aggregate({ _max: { position: true } }),

  create: async (data: Prisma.CourseUncheckedCreateInput, tx?: Db): Promise<AdminCourseSchema> =>
    (await client(tx).course.create({ data })) as AdminCourseSchema,

  update: async (id: string, data: Prisma.CourseUpdateInput, tx?: Db): Promise<AdminCourseSchema> =>
    (await client(tx).course.update({ where: { id }, data })) as AdminCourseSchema,
};
