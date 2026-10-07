import StorageController from "#/controller/storage";
import {
  PresignUploadRequestSchema,
  PresignUploadResponseSchema,
} from "#/controller/storage/storage.schema";
import CustomRouter from "#/lib/router/customRouter";

const fileRoute = new CustomRouter({
  prefix: "/file",
  tags: ["File"],
  authentication: true,
}).post(
  "/presign",
  {
    summary: "Presign a file upload (PUT url + public access url)",
    body: PresignUploadRequestSchema,
    response: PresignUploadResponseSchema,
  },
  async ({ user, body }) => StorageController.presignUpload(user.JSON.id, body),
);

export const fileRouter = fileRoute.route;
