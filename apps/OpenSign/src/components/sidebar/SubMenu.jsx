import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";

const Submenu = ({ item, closeSidebar, toggleSubmenu, submenuOpen }) => {
  const appName =
    "DocuSign™";
  const drivename = appName === "DocuSign™" ? "DocuSign™" : "";
  const { t } = useTranslation();
  const { title, icon, children } = item;
  const { selectedMenu } = useSelector((state) => state.sidebar);

  return (
    <li role="none" className="my-1">
      <button
        onClick={() => toggleSubmenu(item.title)}
        className="flex gap-x-4 items-center justify-start text-left px-4 py-3 mx-2 rounded-xl transition-all duration-200 w-[calc(100%-1rem)] text-base-content/70 hover:bg-base-200 hover:text-base-content focus:outline-none"
        aria-expanded={submenuOpen}
        aria-haspopup="true"
        aria-controls={`submenu-${title}`}
      >
        <span className="w-[20px] h-[20px] flex justify-center items-center">
          <i className={`${icon} text-[18px]`}></i>
        </span>
        <div className="flex justify-between items-center w-full">
          <span className="flex items-center text-sm">
            {t(`sidebar.${item.title}`, { appName })}
          </span>
          <i
            className={`${submenuOpen[item.title]
              ? "fa-light fa-angle-down"
              : "fa-light fa-angle-right"
              } text-xs opacity-70`}
            aria-hidden="true"
          ></i>
        </div>
      </button>
      {submenuOpen[item.title] && (
        <ul id={`submenu-${title}`} role="menu" aria-label={`${title} submenu`} className="mt-1 space-y-1">
          {children.map((childItem) => (
            <li key={childItem.title} role="none">
              <NavLink
                to={
                  childItem.pageType
                    ? `/${childItem.pageType}/${childItem.objectId}`
                    : `/${childItem.objectId}`
                }
                className={({ isActive }) =>
                  `flex items-center gap-x-4 pl-10 pr-4 py-2.5 mx-2 rounded-xl text-sm transition-all duration-200
                  ${isActive && selectedMenu
                    ? "text-primary font-medium bg-primary/5"
                    : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"
                  } focus:outline-none`
                }
                onClick={() => closeSidebar(childItem.title)}
                role="menuitem"
                tabIndex={submenuOpen ? 0 : -1}
              >
                <span className="w-[16px] h-[16px] flex justify-center items-center">
                  <i
                    className={`${childItem.icon} text-[16px]`}
                    aria-hidden="true"
                  ></i>
                </span>
                <span>
                  {t(`sidebar.${item.title}-Children.${childItem.title}`, {
                    appName: drivename
                  })}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default Submenu;
