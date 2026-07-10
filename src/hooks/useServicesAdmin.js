import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createService,
  deleteService,
  listServices,
  reorderServices,
  updateService,
} from "../services/services";

export function useServicesAdmin() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listServices();
      setServices(data);
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
      await toast.promise(createService({ ...payload, display_order: services.length }), {
        loading: "Adding service…",
        success: "Service added",
        error: (err) => err.message || "Couldn't add the service",
      });
      await refresh();
      return true;
    } catch {
      return false;
    }
  }

  async function update(id, payload) {
    try {
      await toast.promise(updateService(id, payload), {
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
      await toast.promise(deleteService(id), {
        loading: "Removing service…",
        success: "Service removed",
        error: (err) => err.message || "Couldn't remove the service",
      });
      await refresh();
    } catch {
      // toast already shown
    }
  }

  async function toggleEnabled(service) {
    try {
      await updateService(service.id, { enabled: !service.enabled });
      toast.success(service.enabled ? "Service disabled" : "Service enabled");
      await refresh();
    } catch (err) {
      toast.error(err.message || "Couldn't update the service");
    }
  }

  async function reorder(orderedIds) {
    setServices((prev) => orderedIds.map((id) => prev.find((s) => s.id === id)));
    try {
      await reorderServices(orderedIds);
    } catch (err) {
      toast.error(err.message || "Couldn't save the new order");
      await refresh();
    }
  }

  return { services, loading, error, refresh, create, update, remove, toggleEnabled, reorder };
}
