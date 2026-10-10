import type { ExtractRequestBody } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import { useMutation } from "@tanstack/react-query";

export type PresignPurpose = ExtractRequestBody<"/storage/presign", "post">["purpose"];

// presign → browser PUTs straight to Garage (CORS set by scripts/garage-cors.mjs) → public URL.
// Content-Type header on the PUT must equal the signed one or SigV4 rejects it.
export const usePresignUpload = () =>
  useMutation({
    mutationKey: ["presignUpload"],
    mutationFn: async ({ purpose, blob }: { purpose: PresignPurpose; blob: Blob }) => {
      const { data, error } = await APIclient.POST("/storage/presign", {
        body: { purpose, contentType: blob.type, size: blob.size },
      });
      if (error) throw error;

      const res = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);

      return data.accessUrl;
    },
  });
