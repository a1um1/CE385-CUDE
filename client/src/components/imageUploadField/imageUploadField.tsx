import Button from "#/components/button";
import Dialog from "#/components/dialog";
import { usePresignUpload, type PresignPurpose } from "#/data/storage.data";
import { cropToBlob } from "#/lib/image";
import { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp";

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as Record<string, unknown>).message);
  }
  return "Upload failed";
}

export interface ImageUploadFieldProps {
  purpose: PresignPurpose;
  /** width / height of the crop frame (1 = square, 32/9 = banner) */
  aspect: number;
  /** longest output edge in px after compression */
  maxDim: number;
  /** compression stops once the blob fits (best effort) */
  targetBytes: number;
  value?: string | null;
  disabled?: boolean;
  onUploaded: (url: string) => void;
}

function ImageUploadField({
  purpose,
  aspect,
  maxDim,
  targetBytes,
  value,
  disabled,
  onUploaded,
}: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const croppedPixels = useRef<Area | null>(null);
  const upload = usePresignUpload();

  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const reset = () => {
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setUploadError(null);
    croppedPixels.current = null;
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.split(",").includes(file.type)) {
      setUploadError("Only PNG, JPEG or WebP images are allowed");
      return;
    }
    setUploadError(null);
    setSrc(URL.createObjectURL(file));
  };

  const handleConfirm = async () => {
    const area = croppedPixels.current;
    if (!src || !area) return;
    try {
      const blob = await cropToBlob(src, area, maxDim, targetBytes);
      const accessUrl = await upload.mutateAsync({ purpose, blob });
      onUploaded(accessUrl);
      reset();
    } catch (error) {
      setUploadError(errorMessage(error));
    }
  };

  const busy = upload.isPending;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled || busy}
        onClick={() => fileRef.current?.click()}
      >
        {busy ? "Uploading…" : value ? "Change image" : "Upload image"}
      </Button>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || busy}
          onClick={() => onUploaded("")}
        >
          Remove
        </Button>
      )}

      <Dialog
        open={src !== null}
        onOpenChange={(open) => !open && !busy && reset()}
        title="Crop image"
        description="Drag to reposition, scroll or pinch to zoom."
        footer={
          <>
            <Button type="button" variant="secondary" disabled={busy} onClick={reset}>
              Cancel
            </Button>
            <Button type="button" variant="primary" disabled={busy} onClick={handleConfirm}>
              {busy ? "Uploading…" : "Crop & upload"}
            </Button>
          </>
        }
      >
        <div className="relative h-72 w-full">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_cropped, pixels) => (croppedPixels.current = pixels)}
            />
          )}
        </div>
        {uploadError && <p className="mt-3 text-sm text-red-500">{uploadError}</p>}
      </Dialog>
    </div>
  );
}

export default ImageUploadField;
