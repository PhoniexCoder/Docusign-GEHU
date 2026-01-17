import { useState, useEffect } from "react";
import dp from "../assets/images/dp.png";
import FullScreenButton from "./FullScreenButton";
import ThemeToggle from "./ThemeToggle";
import { useNavigate } from "react-router";
import Parse from "parse";
import { useWindowSize } from "../hook/useWindowSize";
import {
  getAppLogo,
  openInNewTab,
  saveLanguageInLocal
} from "../constant/Utils";
import { useTranslation } from "react-i18next";
import { appInfo } from "../constant/appinfo";
import { useDispatch } from "react-redux";
import { toggleSidebar } from "../redux/reducers/sidebarReducer";
import { sessionStatus } from "../redux/reducers/userReducer";

const Header = ({ isConsole, setIsLoggingOut }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const username = localStorage.getItem("username") || "";
  const image = localStorage.getItem("profileImg") || dp;
  const [isOpen, setIsOpen] = useState(false);
  const [applogo, setAppLogo] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    closeSidebar();
  };
  const closeSidebar = () => {
    if (width && width <= 768) {
      dispatch(toggleSidebar(false));
    }
  };

  useEffect(() => {
    initializeHead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    closeSidebar();
  }, [width]);

  const showSidebar = () => {
    dispatch(toggleSidebar());
  };


  async function initializeHead() {
    const applogo = await getAppLogo();
    if (applogo?.logo) {
      setAppLogo(applogo?.logo);
    } else {
      const logo = localStorage.getItem("appLogo") || appInfo.applogo;
      setAppLogo(logo);
    }
  }
  const handleLogout = async () => {
    setIsOpen(false);
    setIsLoggingOut(true);
    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("Err while logging out", err);
    } finally {
      dispatch(sessionStatus(true));
    }
    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let baseUrl = localStorage.getItem("baseUrl");
    let appid = localStorage.getItem("parseAppId");
    let favicon = localStorage.getItem("favicon");

    localStorage.clear();
    saveLanguageInLocal(i18n);
    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("userSettings", appdata);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
    localStorage.setItem("favicon", favicon);
    setIsLoggingOut(false);
    navigate("/");
  };

  //handle to close profile drop down menu onclick screen
  useEffect(() => {
    const closeMenuOnOutsideClick = (e) => {
      if (isOpen && !e.target.closest("#profile-menu")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", closeMenuOnOutsideClick);

    return () => {
      // Cleanup the event listener when the component unmounts
      document.removeEventListener("click", closeMenuOnOutsideClick);
    };
  }, [isOpen]);


  useEffect(() => {
    const updateThemeStatus = () => {
      const isDarkTheme =
        document.documentElement.getAttribute("data-theme") === "docusigndark";
      setIsDarkTheme(isDarkTheme);
    };
    updateThemeStatus();

    const observer = new MutationObserver(() => {
      updateThemeStatus();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="op-navbar bg-base-100 border-b border-base-200 h-16 px-4 z-40 relative">
        <div className="flex-none">
          <button
            className="op-btn op-btn-square op-btn-ghost focus:outline-none hover:bg-base-200 op-btn-sm rounded-lg transition-colors"
            onClick={showSidebar}
          >
            <i className="fa-light fa-bars text-xl text-base-content/80"></i>
          </button>
        </div>
        <div className="flex-1 ml-4">
          <div
            onClick={() => navigate("/dashboard/35KBoSgoAK")}
            className="h-[28px] md:h-[42px] flex items-center cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
          >
            {applogo && (
              <img
                className="object-contain h-full w-auto"
                src={
                  isDarkTheme
                    ? "/static/js/assets/images/logo-dark.png"
                    : applogo
                }
                alt="logo"
              />
            )}
          </div>
        </div>
        <div id="profile-menu" className="flex-none gap-3 items-center">
          <div>
            <FullScreenButton />
          </div>
          <div
            onClick={toggleDropdown}
            className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-base-200 transition-colors border border-transparent hover:border-base-200"
          >
            {width >= 768 && (
              <div
                className="w-[32px] h-[32px] rounded-full ring-1 ring-base-300 ring-offset-1 ring-offset-base-100 overflow-hidden"
              >
                <img
                  className="w-full h-full object-cover"
                  src={image}
                  alt="img"
                />
              </div>
            )}
            {width >= 768 && (
              <div
                role="button"
                tabIndex="0"
                className="text-sm font-medium text-base-content/80 hidden lg:block max-w-[120px] truncate"
              >
                {username && username}
              </div>
            )}
            <i className={`fa-light fa-angle-down text-xs text-base-content/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
          </div>

          <div
            className="op-dropdown op-dropdown-end"
            id="profile-menu-dropdown"
          >
            <ul
              tabIndex={0}
              className={`absolute right-0 top-14 mt-1 z-[50] p-2 shadow-xl border border-base-200 op-menu op-menu-sm text-base-content bg-base-100 rounded-xl w-60 origin-top-right transition-all duration-200 ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                }`}
            >
              {!isConsole && (
                <>
                  <li onClick={() => { setIsOpen(false); navigate("/profile"); }}>
                    <span className="py-2.5 px-4 rounded-lg hover:bg-base-200">
                      <i className="fa-light fa-user w-5"></i> {t("profile")}
                    </span>
                  </li>
                  <li onClick={() => { setIsOpen(false); navigate("/changepassword"); }}>
                    <span className="py-2.5 px-4 rounded-lg hover:bg-base-200">
                      <i className="fa-light fa-lock w-5"></i>{" "}
                      {t("change-password")}
                    </span>
                  </li>
                  <li onClick={() => { setIsOpen(false); navigate("/verify-document"); }}>
                    <span className="py-2.5 px-4 rounded-lg hover:bg-base-200">
                      <i className="fa-light fa-check-square w-5"></i>{" "}
                      {t("verify-document")}
                    </span>
                  </li>
                  <li>
                    <span className="py-2.5 px-4 rounded-lg hover:bg-base-200 justify-between">
                      <div className="flex items-center gap-2">
                        <i className="fa-light fa-moon w-5"></i>
                        {t("dark-mode")}
                      </div>
                      <ThemeToggle />
                    </span>
                  </li>
                </>
              )}
              <div className="divider my-1"></div>
              <li onClick={handleLogout}>
                <span className="py-2.5 px-4 rounded-lg hover:bg-base-200 text-error hover:text-error hover:bg-error/10">
                  <i className="fa-light fa-arrow-right-from-bracket w-5"></i>{" "}
                  {t("log-out")}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
