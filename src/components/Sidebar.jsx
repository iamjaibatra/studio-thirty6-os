import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const links = [
    ["Dashboard", "/dashboard"],
    ["Projects", "/projects"],
    ["Media Library", "/media"],
    ["Homepage", "/homepage"],
    ["Archive", "/archive"],
    ["Categories", "/categories"],
  ];

  return (
    <aside
      style={{
        width: 250,
        background: "#161a22",
        padding: 30,
      }}
    >
      <h2 style={{ marginBottom: 40 }}>
        Studio Thirty6
      </h2>

      {links.map(([name, path]) => (
        <NavLink
          key={path}
          to={path}
          style={{
            display: "block",
            color: "white",
            textDecoration: "none",
            marginBottom: 18,
          }}
        >
          {name}
        </NavLink>
      ))}
    </aside>
  );
}