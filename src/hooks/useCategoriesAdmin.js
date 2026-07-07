import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createCategory,
  deleteCategory,
  listCategoriesWithCounts,
  updateCategory,
} from "../services/categories";

export function useCategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCategoriesWithCounts();
      setCategories(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  async function handleCreate(name) {
    try {
      await toast.promise(createCategory(name), {
        loading: "Creating category…",
        success: "Category created",
        error: (err) => err.message || "Couldn't create the category",
      });
      await refresh();
      return true;
    } catch {
      return false;
    }
  }

  async function handleUpdate(id, name) {
    try {
      await toast.promise(updateCategory(id, name), {
        loading: "Saving…",
        success: "Category updated",
        error: (err) => err.message || "Couldn't update the category",
      });
      await refresh();
      return true;
    } catch {
      return false;
    }
  }

  async function handleDelete(id) {
    try {
      await toast.promise(deleteCategory(id), {
        loading: "Deleting category…",
        success: "Category deleted",
        error: (err) => err.message || "Couldn't delete the category",
      });
      await refresh();
    } catch {
      // toast already shown
    }
  }

  return {
    categories,
    loading,
    error,
    refresh,
    createCategory: handleCreate,
    updateCategory: handleUpdate,
    deleteCategory: handleDelete,
  };
}
