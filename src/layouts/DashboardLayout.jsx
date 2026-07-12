import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0f1117] text-white md:flex-row">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="p-4 md:p-[30px]">{children}</main>
      </div>
    </div>
  );
}
