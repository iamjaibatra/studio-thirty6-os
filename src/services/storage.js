import { supabase } from "../lib/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * ASSUMED: `thumbnails` and `videos` buckets are public (public URLs are
 * used directly as thumbnail_url / video_url on the project row). If your
 * buckets are private, swap getPublicUrl() below for
 * supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds).
 */

/**
 * Uploads a file to a Supabase Storage bucket with real progress reporting.
 * supabase-js's storage.upload() doesn't expose progress events, so this
 * talks to the storage REST endpoint directly via XHR.
 *
 * @param {string} bucket - "thumbnails" | "videos"
 * @param {File} file
 * @param {string} path - destination path within the bucket
 * @param {(percent: number) => void} [onProgress]
 * @returns {Promise<{ path: string, publicUrl: string }>}
 */
export async function uploadFile(bucket, file, path, onProgress) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    throw new Error("You must be signed in to upload files.");
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_ANON_KEY);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("Cache-Control", "3600");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        resolve({ path, publicUrl: data.publicUrl });
      } else {
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed due to a network error."));
    xhr.send(file);
  });
}

export async function deleteFile(bucket, path) {
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/**
 * Derives a storage object path (not the full public URL) from a public
 * URL previously stored on a project row, so it can be passed to
 * deleteFile(). Returns null if the URL doesn't match the expected shape.
 */
export function pathFromPublicUrl(bucket, publicUrl) {
  if (!publicUrl) return null;
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

export function buildStoragePath(projectSlug, file) {
  const ext = file.name.split(".").pop();
  const unique = crypto.randomUUID();
  return `${projectSlug}/${unique}.${ext}`;
}
