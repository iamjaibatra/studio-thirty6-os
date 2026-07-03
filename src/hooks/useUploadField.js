import { useState } from "react";
import { uploadFile, buildStoragePath } from "../services/storage";

export function useUploadField(bucket, initialUrl = null) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(initialUrl ? "done" : "idle");

  function selectFile(newFile) {
    setFile(newFile);
    setPreviewUrl(URL.createObjectURL(newFile));
    setStatus("idle");
  }

  /** Uploads the pending file (if any) and returns the URL to persist. */
  async function upload(pathPrefix) {
    if (!file) return previewUrl;

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

  return { previewUrl, progress, status, selectFile, upload };
}
