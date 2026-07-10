import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createArchiveItem,
  deleteArchiveItem,
  listArchiveItems,
  reorderArchiveItems,
  updateArchiveItem,
} from "../services/archiveItems";

export function useArchiveItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listArchiveItems();
      setItems(data);
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

  async function create(payload) {
    try {
      await toast.promise(createArchiveItem({ ...payload, display_order: items.length }), {
        loading: "Adding card…",
        success: "Card added",
        error: (err) => err.message || "Couldn't add the card",
      });
      await refresh();
      return true;
    } catch {
      return false;
    }
  }

  async function update(id, payload) {
    try {
      await toast.promise(updateArchiveItem(id, payload), {
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

  async function remove(id) {
    try {
      await toast.promise(deleteArchiveItem(id), {
        loading: "Removing card…",
        success: "Card removed",
        error: (err) => err.message || "Couldn't remove the card",
      });
      await refresh();
    } catch {
      // toast already shown
    }
  }

  async function reorder(orderedIds) {
    setItems((prev) => orderedIds.map((id) => prev.find((item) => item.id === id)));
    try {
      await reorderArchiveItems(orderedIds);
    } catch (err) {
      toast.error(err.message || "Couldn't save the new order");
      await refresh();
    }
  }

  return { items, loading, error, refresh, create, update, remove, reorder };
}
