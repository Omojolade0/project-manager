import { NavLink } from "react-router-dom";

function ItemsNav({ item, collapsed }) {
  const { label, to, Icon } = item;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150",
          isActive
            ? "bg-slate-900 text-white font-medium"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
          collapsed ? "justify-center" : "",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

export default ItemsNav;
