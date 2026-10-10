import Button from "#/components/button";
import Dialog from "#/components/dialog";
import { usePresignUpload, type PresignPurpose } from "#/data/storage.data";
import { cropToBlob } from "#/lib/image";
import { useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type PercentCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import styles from "./imageUploadField.module.css";

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
  /** called with the uploaded URL; rejection is shown in the dialog */
  onUploaded: (url: string) => void | Promise<void>;
  /** replaces the default buttons — trigger opens the file picker */
  renderTrigger?: (trigger: { onClick: () => void; busy: boolean }) => ReactNode;
}

function ImageUploadField({
  purpose,
  aspect,
  maxDim,
  targetBytes,
  value,
  disabled,
  onUploaded,
  renderTrigger,
}: ImageUploadFieldProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const upload = usePresignUpload();

  // state instead of a ref: renderTrigger needs a click handler that survives
  // the react(refs) lint rule (no .current reads outside event handlers)
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<PercentCrop>();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
    setCrop(undefined);
    setUploadError(null);
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

  // Initial aspect-locked frame covering ~90% of the image, centered.
  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, w, h), w, h));
  };

  const handleConfirm = async () => {
    const img = imgRef.current;
    if (!src || !img || !crop) return;
    // percent crop → natural pixels (cropToBlob draws from the full image)
    const area = {
      x: (crop.x / 100) * img.naturalWidth,
      y: (crop.y / 100) * img.naturalHeight,
      width: (crop.width / 100) * img.naturalWidth,
      height: (crop.height / 100) * img.naturalHeight,
    };
    try {
      setSaving(true);
      const blob = await cropToBlob(src, area, maxDim, targetBytes);
      const accessUrl = await upload.mutateAsync({ purpose, blob });
      await onUploaded(accessUrl);
      reset();
    } catch (error) {
      setUploadError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const busy = upload.isPending || saving;
  const openPicker = () => fileInput?.click();

  return (
    <div className={renderTrigger ? styles["field-contents"] : styles.field}>
      <input
        ref={setFileInput}
        type="file"
        accept={ACCEPTED_TYPES}
        className={styles["file-input"]}
        disabled={disabled || busy}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {renderTrigger ? (
        renderTrigger({ onClick: openPicker, busy })
      ) : (
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || busy}
            onClick={openPicker}
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
        </>
      )}

      <Dialog
        open={src !== null}
        onOpenChange={(open) => !open && !busy && reset()}
        title="Crop image"
        description="Drag the corner handles to adjust the frame."
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
        <div className={styles["crop-area"]}>
          {src && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              aspect={aspect}
              keepSelection
            >
              <img
                ref={imgRef}
                src={src}
                alt="Crop preview"
                onLoad={handleImageLoad}
                className={styles["crop-preview"]}
              />
            </ReactCrop>
          )}
        </div>
        {uploadError && <p className={styles["upload-error"]}>{uploadError}</p>}
      </Dialog>
    </div>
  );
}

export default ImageUploadField;
