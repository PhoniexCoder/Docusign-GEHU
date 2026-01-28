import { useState, useEffect } from "react";
import Menu from "./Menu";
import Submenu from "./SubMenu";
import SocialMedia from "../SocialMedia";
import dp from "../../assets/images/dp.png";
import sidebarList, { subSetting } from "../../json/menuJson";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useWindowSize } from "../../hook/useWindowSize";
import {
  setSelectedMenu,
  toggleSidebar
} from "../../redux/reducers/sidebarReducer";

const Sidebar = () => {
  const { width } = useWindowSize();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const [menuList, setmenuList] = useState([]);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const username = localStorage.getItem("username");
  const image = localStorage.getItem("profileImg") || dp;
  const tenantname = localStorage.getItem("Extand_Class")
    ? JSON.parse(localStorage.getItem("Extand_Class"))?.[0]?.Company
    : "";

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      menuItem();
    }
  }, []);

  const closeSidebar = () => {
    dispatch(setSelectedMenu(true));
    if (width <= 1023) {
      dispatch(toggleSidebar(false));
    }
  };

  const menuItem = async () => {
    try {
      if (localStorage.getItem("defaultmenuid")) {
        const Extand_Class = localStorage.getItem("Extand_Class");
        const extClass = Extand_Class && JSON.parse(Extand_Class);
        const userRole = extClass?.[0]?.UserRole || "contracts_User";
        const isAdmin =
          userRole === "contracts_Admin" || userRole === "contracts_OrgAdmin";
        const newSidebarList = sidebarList.map((item) => {
          if (item.title !== "Settings") return item;
          const newItem = { ...item };
          const baseChildren = isAdmin ? subSetting : subSetting?.slice(0, 1);
          const mysignature = newItem.children.slice(0, 1);
          newItem.children = [...mysignature, ...baseChildren];
          return newItem;
        });
        setmenuList(newSidebarList);
      }
    } catch (e) {
      console.error("Problem", e);
    }
  };

  const toggleSubmenu = (title) => {
    dispatch(setSelectedMenu(false));
    setSubmenuOpen({ [title]: !submenuOpen[title] });
  };

  const handleMenuItem = () => {
    dispatch(setSelectedMenu(true));
    closeSidebar();
    setSubmenuOpen({});
  };
  const handleProfile = () => {
    closeSidebar();
    navigate("/profile");
  };
  return (
    <aside
      className={`absolute max-lg:min-h-screen lg:relative bg-base-100 overflow-y-auto transition-all duration-300 z-[500] border-r border-base-200 hide-scrollbar
     ${isOpen ? "w-full md:w-64" : "w-0 overflow-hidden"}`}
    >
      <div className="flex px-4 py-6 gap-3 items-center border-b border-base-200/50 mb-2">
        <div
          onClick={() => handleProfile()}
          className="w-[50px] h-[50px] min-w-[50px] rounded-full ring-2 ring-base-200 ring-offset-2 ring-offset-base-100 overflow-hidden cursor-pointer hover:ring-primary transition-all"
        >
          <img
            className="w-full h-full object-cover"
            src={image}
            alt="Profile"
          />
        </div>
        <div className="overflow-hidden">
          <p
            onClick={handleProfile}
            className="text-sm font-bold text-base-content cursor-pointer truncate hover:text-primary transition-colors"
          >
            {username}
          </p>
          <p
            onClick={handleProfile}
            className={`cursor-pointer text-xs text-base-content/60 truncate hover:text-base-content transition-colors ${tenantname ? "mt-0.5" : ""
              }`}
          >
            {tenantname}
          </p>
        </div>
      </div>
      <nav
        className="op-menu op-menu-sm px-2"
        aria-label="DocuSign Sidebar Navigation"
      >
        <ul
          className="text-sm space-y-1"
          role="menubar"
          aria-label="DocuSign Sidebar Navigation"
        >
          {menuList.map((item) =>
            !item.children ? (
              <Menu
                key={item.title}
                item={item}
                isOpen={isOpen}
                closeSidebar={handleMenuItem}
              />
            ) : (
              <Submenu
                key={item.title}
                item={item}
                closeSidebar={closeSidebar}
                toggleSubmenu={toggleSubmenu}
                submenuOpen={submenuOpen}
              />
            )
          )}
        </ul>
      </nav>
      <footer className="mt-auto py-6 flex justify-center items-center text-xl text-base-content/40 gap-4 border-t border-base-200/50 mx-4">
        <SocialMedia />
      </footer>
    </aside>
  );
};

export default Sidebar;
