import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Archive from "./pages/Archive";
import Categories from "./pages/Categories";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
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
      <Route path="/" element={<Login />} />

  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/projects" element={<Projects />} />
  <Route path="/projects/:id" element={<ProjectDetails />} />
  <Route path="/archive" element={<Archive />} />
  <Route path="/categories" element={<Categories />} />
      </Routes>
    </BrowserRouter>
  );
}