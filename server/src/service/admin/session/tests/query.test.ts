import { describe, expect, it } from "vitest";
import { getSessionById, querySession } from "#/service/admin/session";
import { mockDB } from "#/test/setup";

const baseArgs = (where: object) => ({
  where,
  take: 11,
  skip: 0,
  cursor: undefined,
  orderBy: { createdAt: "desc" },
  select: expect.any(Object),
});

describe("querySession", () => {
  it("maps result filters to session and submission state", async () => {
    mockDB.sessions.findMany.mockResolvedValue([]);
    await querySession({ perPage: 10, direction: "forward", result: "GRADING" });
    expect(mockDB.sessions.findMany).toHaveBeenCalledWith(
      baseArgs({
        status: { in: ["SUBMITTED", "GRADED"] },
        OR: [{ submissions: { none: {} } }, { submissions: { some: { isGraded: false } } }],
      }),
    );
  });

  it("maps PASSED to fully graded, fully passing sessions", async () => {
    mockDB.sessions.findMany.mockResolvedValue([]);
    await querySession({ perPage: 10, direction: "forward", result: "PASSED" });
    expect(mockDB.sessions.findMany).toHaveBeenCalledWith(
      baseArgs({
        status: { in: ["SUBMITTED", "GRADED"] },
        submissions: { some: {}, every: { isGraded: true, ok: true } },
      }),
    );
  });

  it("filters by curriculum and user", async () => {
    mockDB.sessions.findMany.mockResolvedValue([]);
    await querySession({
      perPage: 10,
      direction: "forward",
      userSearch: " john ",
      courseID: "019488a0-7212-789a-bcde-fe1234567890",
      unitID: "019488a0-7212-789a-bcde-fe1234567891",
      lessonID: "019488a0-7212-789a-bcde-fe1234567892",
    });
    expect(mockDB.sessions.findMany).toHaveBeenCalledWith(
      baseArgs({
        LessonID: "019488a0-7212-789a-bcde-fe1234567892",
        lesson: {
          is: {
            unitID: "019488a0-7212-789a-bcde-fe1234567891",
            unit: { is: { courseID: "019488a0-7212-789a-bcde-fe1234567890" } },
          },
        },
        user: {
          is: {
            OR: [
              { name: { contains: "john", mode: "insensitive" } },
              { email: { contains: "john", mode: "insensitive" } },
            ],
          },
        },
      }),
    );
  });
});

describe("getSessionById", () => {
  it("throws 404 when missing", async () => {
    mockDB.sessions.findUnique.mockResolvedValueOnce(null);
    await expect(getSessionById("019488a0-7212-789a-bcde-fe1234567890")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("flattens each submission's code exercise", async () => {
    mockDB.sessions.findUnique.mockResolvedValueOnce({
      id: "019488a0-7212-789a-bcde-fe1234567890",
      submissions: [
        {
          id: "019488a0-7212-789a-bcde-fe1234567891",
          exerciseID: "019488a0-7212-789a-bcde-fe1234567892",
          content: { code: 'print("hi")' },
          isGraded: true,
          ok: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          exercise: {
            id: "019488a0-7212-789a-bcde-fe1234567892",
            name: "Exercise",
            content: "Statement",
            codeExercises: { language: "python" },
          },
        },
      ],
    } as never);

    const session = await getSessionById("019488a0-7212-789a-bcde-fe1234567890");

    expect(session.submissions[0]?.exercise).toEqual({
      id: "019488a0-7212-789a-bcde-fe1234567892",
      name: "Exercise",
      content: "Statement",
      codeExercise: { language: "python" },
    });
  });
});
