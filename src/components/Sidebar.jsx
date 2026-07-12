import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const links = [
    ["Dashboard", "/dashboard"],
    ["Projects", "/projects"],
    ["Media Library", "/media"],
    ["Homepage", "/homepage"],
    ["Transmit", "/transmit"],
    ["Archive Page", "/archive-page"],
    ["Edit", "/edit-page"],
    ["Lenses", "/lenses"],
    ["Archive", "/archive"],
    ["Categories", "/categories"],
  ];

  return (
    <aside className="w-full shrink-0 bg-[#161a22] p-4 md:w-[250px] md:p-[30px]">
      <h2 className="mb-4 md:mb-10">Studio Thirty6</h2>

      <nav className="flex gap-1 overflow-x-auto md:block md:overflow-visible">
        {links.map(([name, path]) => (
          <NavLink
            key={path}
            to={path}
            className="block whitespace-nowrap px-2 py-1.5 text-white no-underline md:mb-[18px] md:px-0 md:py-0"
          >
            {name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
