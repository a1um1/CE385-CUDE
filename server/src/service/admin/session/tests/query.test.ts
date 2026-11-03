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
    await querySession({ perPage: 10, direction: "forward", result: "PASS" });
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
  it("filters out rows that do not match the requested grade status", async () => {
    mockDB.sessions.findMany.mockResolvedValueOnce([
      {
        id: "019488a0-7212-789a-bcde-fe1234567890",
        userID: "019488a0-7212-789a-bcde-fe1234567891",
        LessonID: "019488a0-7212-789a-bcde-fe1234567892",
        status: "SUBMITTED",
        rewarded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { name: "User", email: "user@test.com", profileImage: null },
        lesson: {
          id: "019488a0-7212-789a-bcde-fe1234567892",
          name: "Lesson",
          unit: {
            id: "019488a0-7212-789a-bcde-fe1234567893",
            name: "Unit",
            course: {
              id: "019488a0-7212-789a-bcde-fe1234567894",
              name: "Course",
              color: "red",
              icon: "book",
            },
          },
        },
        // Only 2 passing submissions, but lesson has 5 code exercises
        submissions: [
          { isGraded: true, ok: true },
          { isGraded: true, ok: true },
        ],
      },
    ] as never);
    mockDB.exercise.findMany.mockResolvedValueOnce([
      { lessonID: "019488a0-7212-789a-bcde-fe1234567892" },
      { lessonID: "019488a0-7212-789a-bcde-fe1234567892" },
      { lessonID: "019488a0-7212-789a-bcde-fe1234567892" },
      { lessonID: "019488a0-7212-789a-bcde-fe1234567892" },
      { lessonID: "019488a0-7212-789a-bcde-fe1234567892" },
    ] as never);

    const result = await querySession({ perPage: 10, direction: "forward", result: "PASS" });
    expect(result.data).toHaveLength(0);
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
