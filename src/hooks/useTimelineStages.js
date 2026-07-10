import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createTimelineStage,
  deleteTimelineStage,
  listTimelineStages,
  reorderTimelineStages,
  updateTimelineStage,
} from "../services/timelineStages";

export function useTimelineStages() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTimelineStages();
      setStages(data);
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
      await toast.promise(createTimelineStage({ ...payload, stage_order: stages.length }), {
        loading: "Adding stage…",
        success: "Stage added",
        error: (err) => err.message || "Couldn't add the stage",
      });
      await refresh();
      return true;
    } catch {
      return false;
    }
  }

  async function update(id, payload) {
    try {
      await toast.promise(updateTimelineStage(id, payload), {
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
      await toast.promise(deleteTimelineStage(id), {
        loading: "Removing stage…",
        success: "Stage removed",
        error: (err) => err.message || "Couldn't remove the stage",
      });
      await refresh();
    } catch {
      // toast already shown
    }
  }

  async function reorder(orderedIds) {
    setStages((prev) => orderedIds.map((id) => prev.find((s) => s.id === id)));
    try {
      await reorderTimelineStages(orderedIds);
    } catch (err) {
      toast.error(err.message || "Couldn't save the new order");
      await refresh();
    }
  }

  return { stages, loading, error, refresh, create, update, remove, reorder };
}
