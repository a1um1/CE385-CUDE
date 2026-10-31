import {
  AdminSessionDetailSchema,
  AdminSessionListResponseSchema,
  AdminSessionQuerySchema,
} from "#/service/admin/session/session.schema";
import { getSessionById, querySession } from "#/service/admin/session";
import { z } from "#/lib/extendZod";
import CustomRouter from "#/lib/router/customRouter";

const adminSessionRouter = new CustomRouter({
  prefix: "/admin/submission",
  tags: ["Admin Session Management"],
  authentication: ["ADMIN"],
})
  .get(
    "/",
    {
      summary: "List lesson sessions",
      description:
        "Cursor-paginated list of every lesson session, newest first. Requires an ADMIN token.\n\n" +
        "Filter by `result` (`PASSED`, `FAILED`, `GRADING`, `ONGOING`, `GIVEUP`) and by " +
        "`userSearch`, which matches the owner's name or email (case-insensitive substring). " +
        "Narrow to a lesson with `courseID`, `unitID` or `lessonID`.",
      query: AdminSessionQuerySchema,
      response: AdminSessionListResponseSchema,
    },
    async ({ query }) => await querySession(query),
  )
  .get(
    "/:id",
    {
      summary: "Get lesson session by ID",
      description:
        "Return one lesson session with every submission of that session, including the exercise " +
        "statement and the submitted code. Requires an ADMIN token.",
      params: z.object({ id: z.uuidv7() }),
      response: AdminSessionDetailSchema,
    },
    async ({ params }) => await getSessionById(params.id),
  );

export const adminSessionRoute = adminSessionRouter.route;
