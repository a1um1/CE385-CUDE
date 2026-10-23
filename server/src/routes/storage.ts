import StorageService from "#/service/storage/storage";
import {
  PresignUploadRequestSchema,
  PresignUploadResponseSchema,
} from "#/service/storage/storage.schema";
import CustomRouter from "#/lib/router/customRouter";

const storageRoute = new CustomRouter({
  prefix: "/storage",
  tags: ["Storage"],
  authentication: true,
}).post(
  "/presign",
  {
    summary: "Presign a direct upload to object storage",
    description:
      "Create a short-lived presigned URL so the client can upload a file straight to object storage " +
      "instead of through the API. Requires an authenticated user.\n\n" +
      "Returns the upload URL and the object key. Send that key back to `POST /user/avatar` or " +
      "`POST /user/background` to attach the file to the profile.",
    body: PresignUploadRequestSchema,
    response: PresignUploadResponseSchema,
  },
  async ({ user, body }) => StorageService.presignUpload(user.JSON.id, body),
);

export const storageRouter = storageRoute.route;
