import StorageController from "#/controller/storage/storage";
import {
  PresignUploadRequestSchema,
  PresignUploadResponseSchema,
} from "#/controller/storage/storage.schema";
import CustomRouter from "#/lib/router/customRouter";

const storageRoute = new CustomRouter({
  prefix: "/storage",
  tags: ["Storage"],
  authentication: true,
}).post(
  "/presign",
  {
    summary: "Presign a direct upload to object storage",
    body: PresignUploadRequestSchema,
    response: PresignUploadResponseSchema,
  },
  async ({ user, body }) => StorageController.presignUpload(user.JSON.id, body),
);

export const storageRouter = storageRoute.route;
