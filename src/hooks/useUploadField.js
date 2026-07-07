import { useState } from "react";
import { uploadFile, buildStoragePath } from "../services/storage";

/**
 * Manages one upload field (thumbnail or video): selecting a new file,
 * removing the existing one, upload progress, and reporting back whether
 * anything changed so the caller can clean up the old storage object.
 */
export function useUploadField(bucket, initialUrl = null) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(initialUrl ? "done" : "idle");
  const [removed, setRemoved] = useState(false);

  function selectFile(newFile) {
    setFile(newFile);
    setPreviewUrl(URL.createObjectURL(newFile));
    setStatus("idle");
    setRemoved(false);
  }

  function remove() {
    setFile(null);
    setPreviewUrl(null);
    setStatus("idle");
    setRemoved(true);
  }

  /**
   * Uploads the pending file (if any) and returns the URL to persist —
   * or null if the field was cleared, or the original URL if untouched.
   */
  async function upload(pathPrefix) {
    if (file) {
      setStatus("uploading");
      setProgress(0);
      try {
        const path = buildStoragePath(pathPrefix, file);
        const { publicUrl } = await uploadFile(bucket, file, path, setProgress);
        setStatus("done");
        return publicUrl;
      } catch (err) {
        setStatus("error");
        throw err;
      }
    }

    if (removed) return null;
    return previewUrl;
  }

  return {
    previewUrl,
    progress,
    status,
    changed: Boolean(file) || removed,
    initialUrl,
    selectFile,
    remove,
    upload,
  };
}
