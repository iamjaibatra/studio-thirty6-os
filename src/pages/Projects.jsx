import { Plus } from "lucide-react";

export default function Projects() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <h1>Projects</h1>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            background: "#6d5dfc",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      <div
        style={{
          background: "#1a1f2b",
          borderRadius: 12,
          padding: 24,
        }}
      >
        No projects yet.
      </div>
    </div>
  );
}