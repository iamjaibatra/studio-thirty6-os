import Projects from "./pages/Projects";
import Archive from "./pages/Archive";
import Categories from "./pages/Categories";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Login />} />

  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/projects" element={<Projects />} />
  <Route path="/archive" element={<Archive />} />
  <Route path="/categories" element={<Categories />} />
      </Routes>
    </BrowserRouter>
  );
}