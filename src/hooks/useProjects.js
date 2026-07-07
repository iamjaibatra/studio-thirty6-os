import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  archiveProject,
  createProject,
  deleteProject,
  duplicateProject,
  listProjects,
  setFeatured,
  setPublished,
  updateProject,
} from "../services/projects";

const DEFAULT_FILTERS = {
  search: "",
  categoryId: "",
  year: "",
  featured: null,
  published: null,
  sort: "newest",
};

export function useProjects() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async (activeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listProjects(activeFilters);
      setProjects(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Realtime search + filters, debounced so we don't hammer Supabase on
  // every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => fetchProjects(filters), 250);
    return () => clearTimeout(timer);
  }, [filters, fetchProjects]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const refresh = useCallback(() => fetchProjects(filters), [fetchProjects, filters]);

  // create/update are intentionally allowed to throw — ProjectForm awaits
  // them and needs to know about failure so it can keep the modal open.
  async function handleCreate(payload) {
    const created = await toast.promise(createProject(payload), {
      loading: "Creating project…",
      success: "Project created",
      error: (err) => err.message || "Couldn't create the project",
    });
    await refresh();
    return created;
  }

  async function handleUpdate(id, payload) {
    const updated = await toast.promise(updateProject(id, payload), {
      loading: "Saving changes…",
      success: "Project updated",
      error: (err) => err.message || "Couldn't save changes",
    });
    await refresh();
    return updated;
  }

  // Everything below is fired from menu clicks with no local error
  // handling at the call site, so these swallow their own errors after
  // showing a toast — otherwise a failure becomes an unhandled promise
  // rejection in the console.
  async function handleDelete(project) {
    try {
      await toast.promise(deleteProject(project), {
        loading: "Deleting project…",
        success: "Project deleted",
        error: (err) => err.message || "Couldn't delete the project",
      });
      await refresh();
    } catch {
      // toast already shown
    }
  }

  async function handleArchive(project) {
    try {
      await toast.promise(archiveProject(project), {
        loading: "Archiving project…",
        success: "Project archived",
        error: (err) => err.message || "Couldn't archive the project",
      });
      await refresh();
    } catch {
      // toast already shown
    }
  }

  async function handleDuplicate(project) {
    try {
      await toast.promise(duplicateProject(project), {
        loading: "Duplicating project…",
        success: "Project duplicated",
        error: (err) => err.message || "Couldn't duplicate the project",
      });
      await refresh();
    } catch {
      // toast already shown
    }
  }

  async function handleToggleFeatured(project) {
    try {
      await setFeatured(project.id, !project.featured);
      toast.success(!project.featured ? "Marked as featured" : "Removed from featured");
      await refresh();
    } catch (err) {
      toast.error(err.message || "Couldn't update the project");
    }
  }

  async function handleTogglePublished(project) {
    try {
      await setPublished(project.id, !project.published);
      toast.success(!project.published ? "Project published" : "Project unpublished");
      await refresh();
    } catch (err) {
      toast.error(err.message || "Couldn't update the project");
    }
  }

  return {
    projects,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    refresh,
    createProject: handleCreate,
    updateProject: handleUpdate,
    deleteProject: handleDelete,
    archiveProject: handleArchive,
    duplicateProject: handleDuplicate,
    toggleFeatured: handleToggleFeatured,
    togglePublished: handleTogglePublished,
  };
}
