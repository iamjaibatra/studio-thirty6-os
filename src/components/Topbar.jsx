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
    <div className="flex h-[60px] items-center justify-between bg-[#181d25] px-4 md:h-[70px] md:px-[30px]">
      <h3 className="text-[15px] md:text-base">Studio Thirty6 OS</h3>

      <div className="flex items-center gap-2 md:gap-4">
        <span className="hidden text-[13px] text-[#9a9aa6] sm:inline">{user?.email || ""}</span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-2.5 py-1.5 text-[12.5px] text-[#9a9aa6] md:px-3"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );
}
