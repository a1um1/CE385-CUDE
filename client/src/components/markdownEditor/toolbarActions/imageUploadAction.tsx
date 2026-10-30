import * as React from "react";
import { Image, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePresignUpload } from "#/data/storage.data";
import { useMarkdownEditor } from "../editorContext";
import { ToolbarButton } from "./actionItem";

export function ImageUploadAction() {
  const { insertBlock, disabled, showEditor } = useMarkdownEditor();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const upload = usePresignUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const accessUrl = await upload.mutateAsync({
        purpose: "exercise-asset",
        blob: file,
      });

      insertBlock(`![${file.name}](${accessUrl})`);
      toast.success("Image uploaded successfully");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <ToolbarButton
        title={upload.isPending ? "Uploading image..." : "Upload Image"}
        disabled={disabled || !showEditor || upload.isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        {upload.isPending ? (
          <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Image size={15} />
        )}
      </ToolbarButton>
    </>
  );
}
