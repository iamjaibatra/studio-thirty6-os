import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import ProjectsToolbar from "../components/ProjectsToolbar";
import ProjectGrid from "../components/ProjectGrid";
import ProjectForm from "../components/ProjectForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useProjects } from "../hooks/useProjects";
import { useCategories } from "../hooks/useCategories";

export default function Projects() {
  const navigate = useNavigate();
  const {
    projects,
    loading,
    filters,
    updateFilter,
    resetFilters,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    duplicateProject,
    toggleFeatured,
  } = useProjects();
  const { categories } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [confirmState, setConfirmState] = useState(null); // { type: "delete" | "archive", project }

  function openCreate() {
    setEditingProject(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEdit(project) {
    setEditingProject(project);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  async function handleSave(payload) {
    if (editingProject) {
      await updateProject(editingProject.id, payload);
    } else {
      await createProject(payload);
    }
  }

  function requestDelete(project) {
    setConfirmState({ type: "delete", project });
  }

  function requestArchive(project) {
    setConfirmState({ type: "archive", project });
  }

  async function handleConfirm() {
    if (!confirmState) return;
    const { type, project } = confirmState;
    if (type === "delete") await deleteProject(project);
    if (type === "archive") await archiveProject(project);
  }

  return (
    <DashboardLayout>
      <ProjectsToolbar
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        categories={categories}
        onNewProject={openCreate}
      />

      <ProjectGrid
        projects={projects}
        loading={loading}
        onOpen={(project) => navigate(`/projects/${project.id}`)}
        onEdit={openEdit}
        onDelete={requestDelete}
        onArchive={requestArchive}
        onDuplicate={duplicateProject}
        onToggleFeatured={toggleFeatured}
        onNewProject={openCreate}
      />

      <ProjectForm
        key={formKey}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        project={editingProject}
        categories={categories}
      />

      <ConfirmDialog
        open={Boolean(confirmState)}
        onClose={() => setConfirmState(null)}
        onConfirm={handleConfirm}
        title={confirmState?.type === "delete" ? "Delete project" : "Archive project"}
        description={
          confirmState?.type === "delete"
            ? `"${confirmState?.project?.title}" and its uploaded files will be permanently deleted. This can't be undone.`
            : `"${confirmState?.project?.title}" will be moved to the archive and removed from active projects.`
        }
        confirmLabel={confirmState?.type === "delete" ? "Delete" : "Archive"}
        tone={confirmState?.type === "delete" ? "danger" : "default"}
      />
    </DashboardLayout>
  );
}
