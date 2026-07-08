import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getPageContent, savePageContent } from "../services/pageContent";

export function usePageContent(page) {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPageContent(page);
      setSections(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  async function save(section, content) {
    try {
      await toast.promise(savePageContent(page, section, content), {
        loading: "Saving…",
        success: "Saved",
        error: (err) => err.message || "Couldn't save changes",
      });
      setSections((prev) => ({ ...prev, [section]: content }));
      return true;
    } catch {
      return false;
    }
  }

  return { sections, loading, error, refresh, save };
}
