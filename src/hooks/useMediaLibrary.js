import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  countMediaUsage,
  deleteMedia,
  listMedia,
  updateMedia,
  uploadMedia,
} from "../services/media";

export function useMediaLibrary() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type: "", search: "", tag: "" });
  const [uploads, setUploads] = useState([]); // [{ id, name, progress, status }]

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMedia(filters);
      setAssets(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(refresh, 200);
    return () => clearTimeout(timer);
  }, [refresh]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  async function handleUpload(files) {
    const list = Array.from(files);

    for (const file of list) {
      const uploadId = `${file.name}-${Date.now()}-${Math.random()}`;
      setUploads((prev) => [...prev, { id: uploadId, name: file.name, progress: 0, status: "uploading" }]);

      try {
        await uploadMedia(file, {}, (progress) => {
          setUploads((prev) => prev.map((u) => (u.id === uploadId ? { ...u, progress } : u)));
        });
        setUploads((prev) => prev.map((u) => (u.id === uploadId ? { ...u, status: "done", progress: 100 } : u)));
        toast.success(`Uploaded ${file.name}`);
      } catch (err) {
        setUploads((prev) => prev.map((u) => (u.id === uploadId ? { ...u, status: "error" } : u)));
        toast.error(`Couldn't upload ${file.name}: ${err.message || "unknown error"}`);
      }
    }

    setTimeout(() => setUploads((prev) => prev.filter((u) => u.status === "uploading")), 2500);
    await refresh();
  }

  async function handleUpdate(id, patch) {
    try {
      await toast.promise(updateMedia(id, patch), {
        loading: "Saving…",
        success: "Saved",
        error: (err) => err.message || "Couldn't save changes",
      });
      await refresh();
      return true;
    } catch {
      return false;
    }
  }

  async function handleDelete(asset) {
    try {
      await toast.promise(deleteMedia(asset), {
        loading: "Deleting…",
        success: "Asset deleted",
        error: (err) => err.message || "Couldn't delete this asset",
      });
      await refresh();
    } catch {
      // toast already shown
    }
  }

  async function checkUsage(mediaId) {
    try {
      return await countMediaUsage(mediaId);
    } catch {
      return 0;
    }
  }

  return {
    assets,
    loading,
    error,
    filters,
    updateFilter,
    uploads,
    refresh,
    uploadMedia: handleUpload,
    updateMedia: handleUpdate,
    deleteMedia: handleDelete,
    checkUsage,
  };
}
