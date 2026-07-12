import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { signOut } from "../services/auth";
import { useAuth } from "../hooks/useAuth";

export default function Topbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleSignOut() {
    const { error } = await signOut();
    if (error) {
      toast.error(error.message || "Couldn't sign out");
      return;
    }
    navigate("/");
  }

  return (
    <div
      style={{
        height: 70,
        background: "#181d25",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
      }}
    >
      <h3>Studio Thirty6 OS</h3>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ color: "#9a9aa6", fontSize: 13 }}>{user?.email || ""}</span>
        <button
          onClick={handleSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            color: "#9a9aa6",
            padding: "7px 12px",
            fontSize: 12.5,
            cursor: "pointer",
          }}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );
}
