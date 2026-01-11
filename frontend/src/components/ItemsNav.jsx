import { NavLink } from "react-router-dom";

function ItemsNav({ item, collapsed }) {
  const { label, to, Icon } = item;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          "hover:bg-slate-300/60",
          isActive ? "bg-white shadow-sm" : "",
          collapsed ? "justify-center px-2" : "",
        ].join(" ")
      }
    >
      <Icon className="h-5 w-5 text-slate-700" />
      {!collapsed && <span className="text-slate-800">{label}</span>}
    </NavLink>
  );
}

export default ItemsNav;
