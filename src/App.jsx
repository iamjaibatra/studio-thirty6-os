import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import MediaLibrary from "./pages/MediaLibrary";
import Homepage from "./pages/Homepage";
import Transmit from "./pages/Transmit";
import ArchivePage from "./pages/ArchivePage";
import EditPage from "./pages/EditPage";
import LensesPage from "./pages/LensesPage";
import Archive from "./pages/Archive";
import Categories from "./pages/Categories";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08080a",
          color: "#9a9aa6",
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#131318",
            color: "#f3f3f6",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: "13px",
          },
        }}
      />
      <Routes>
        <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />

        <Route path="/dashboard" element={<ProtectedRoute session={session}><Dashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute session={session}><Projects /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute session={session}><ProjectDetails /></ProtectedRoute>} />
        <Route path="/media" element={<ProtectedRoute session={session}><MediaLibrary /></ProtectedRoute>} />
        <Route path="/homepage" element={<ProtectedRoute session={session}><Homepage /></ProtectedRoute>} />
        <Route path="/transmit" element={<ProtectedRoute session={session}><Transmit /></ProtectedRoute>} />
        <Route path="/archive-page" element={<ProtectedRoute session={session}><ArchivePage /></ProtectedRoute>} />
        <Route path="/edit-page" element={<ProtectedRoute session={session}><EditPage /></ProtectedRoute>} />
        <Route path="/lenses" element={<ProtectedRoute session={session}><LensesPage /></ProtectedRoute>} />
        <Route path="/archive" element={<ProtectedRoute session={session}><Archive /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute session={session}><Categories /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={session ? "/dashboard" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
