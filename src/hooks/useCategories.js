import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { listCategories } from "../services/categories";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listCategories();
        if (!cancelled) setCategories(data);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          toast.error("Couldn't load categories — filters and the project form may be incomplete.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}
