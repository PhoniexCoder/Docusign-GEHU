import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";

const Menu = ({ item, isOpen, closeSidebar }) => {
  const appName =
    "OpenSign™";
  const drivename = appName === "OpenSign™" ? "OpenSign™" : "";
  const { t } = useTranslation();
  const { selectedMenu } = useSelector((state) => state.sidebar);

  return (
    <li>
      <NavLink
        to={
          item.pageType
            ? `/${item.pageType}/${item.objectId}`
            : `/${item.objectId}`
        }
        className={({ isActive }) =>
          `flex gap-x-4 items-center justify-start text-left px-4 py-3 mx-2 rounded-xl transition-all duration-200
             ${isActive && selectedMenu
            ? "bg-primary/10 text-primary font-semibold shadow-sm"
            : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
          } focus:outline-none`
        }
        onClick={() => closeSidebar(item.title)}
        tabIndex={isOpen ? 0 : -1}
        role="menuitem"
      >
        <span className="w-[20px] h-[20px] flex justify-center items-center">
          <i className={`${item.icon} text-[18px]`} aria-hidden="true"></i>
        </span>
        <span className="flex items-center text-sm">
          {t(`sidebar.${item.title}`, { appName: drivename })}
        </span>
      </NavLink>
    </li>
  );
};

export default Menu;
