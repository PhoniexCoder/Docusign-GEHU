import { useEffect, useState } from "react";
import Parse from "parse";
import { useDispatch } from "react-redux";
import axios from "axios";
import { NavLink, useNavigate, useLocation } from "react-router";
import login_img from "../assets/images/login_img.svg";
import { useWindowSize } from "../hook/useWindowSize";
import ModalUi from "../primitives/ModalUi";
import {
  emailRegex,
} from "../constant/const";
import Alert from "../primitives/Alert";
import { appInfo } from "../constant/appinfo";
import { fetchAppInfo } from "../redux/reducers/infoReducer";
import { showTenant } from "../redux/reducers/ShowTenant";
import {
  getAppLogo,
  saveLanguageInLocal,
  usertimezone
} from "../constant/Utils";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";


function Login() {
  const appName =
    "DocuSign™";
  console.log("Login page loaded, checking user existence...");
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const [state, setState] = useState({
    email: "",
    password: "",
    alertType: "success",
    alertMsg: "",
    passwordVisible: false,
    loading: false,
    thirdpartyLoader: false,
  });
  const [userDetails, setUserDetails] = useState({
    Company: "",
    Destination: ""
  });
  const [isModal, setIsModal] = useState(false);
  const [image, setImage] = useState();
  const [errMsg, setErrMsg] = useState();
  useEffect(() => {
    handleUserExist();
    // eslint-disable-next-line
  }, []);

  const handleUserExist = async () => {
    checkUserExt();
  };


  const setLocalVar = (user) => {
    localStorage.setItem("accesstoken", user.sessionToken);
    localStorage.setItem("UserInformation", JSON.stringify(user));
    localStorage.setItem("userEmail", user.email);
    if (user.ProfilePic) {
      localStorage.setItem("profileImg", user.ProfilePic);
    } else {
      localStorage.setItem("profileImg", "");
    }
  };

  const showToast = (type, msg) => {
    setState({ ...state, loading: false, alertType: type, alertMsg: msg });
    setTimeout(() => setState({ ...state, alertMsg: "" }), 2000);
  };

  const checkUserExt = async () => {
    const app = await getAppLogo();
    console.log("getAppLogo response:", app);
    if (app?.error === "invalid_json") {
      setErrMsg(t("server-down", { appName: appName }));
    } else if (app?.user === "error" || app?.error) {
      setErrMsg(`Error: ${app?.error || "Unknown Error"}`);
    } else if (
      app?.user === "not_exist"
    ) {
      navigate("/addadmin");
    }
    if (app?.logo) {
      setImage(app?.logo);
    } else {
      setImage(appInfo?.applogo || undefined);
    }
    dispatch(fetchAppInfo());
    if (localStorage.getItem("accesstoken")) {
      setState({ ...state, loading: true });
      GetLoginData();
    }
  };
  const handleChange = (event) => {
    let { name, value } = event.target;
    if (name === "email") {
      value = value?.toLowerCase()?.replace(/\s/g, "");
    }
    setState({ ...state, [name]: value });
  };

  const handleLogin = async (
  ) => {
    const email = state?.email
    const password = state?.password

    if (!email || !password) {
      return;
    }
    localStorage.removeItem("accesstoken");
    try {
      setState({ ...state, loading: true });
      localStorage.setItem("appLogo", appInfo.applogo);
      const _user = await Parse.Cloud.run("loginuser", { email, password });
      if (!_user) {
        setState({ ...state, loading: false });
        return;
      }
      // Get extended user data (including 2FA status) using cloud function
      try {
        await Parse.User.become(_user.sessionToken);
        setLocalVar(_user);
        await continueLoginFlow();
      } catch (error) {
        console.error("Error checking 2FA status:", error);
        showToast("danger", t("something-went-wrong-mssg"));
      }
    } catch (error) {
      console.error("Error while logging in user", error);
      if (error?.code === 1001) {
        showToast("danger", t("action-prohibited"));
      } else {
        showToast("danger", t("invalid-username-password-region"));
      }
    }
  };
  const handleLoginBtn = async (event) => {
    event.preventDefault();
    if (!emailRegex.test(state.email)) {
      alert(t("valid-email-alert"));
      return;
    }
    await handleLogin();
  };

  const setThirdpartyLoader = (value) => {
    setState({ ...state, thirdpartyLoader: value });
  };

  const thirdpartyLoginfn = async (sessionToken) => {
    const baseUrl = localStorage.getItem("baseUrl");
    const parseAppId = localStorage.getItem("parseAppId");
    const res = await axios.get(baseUrl + "users/me", {
      headers: {
        "X-Parse-Session-Token": sessionToken,
        "X-Parse-Application-Id": parseAppId
      }
    });
    await Parse.User.become(sessionToken).then(() => {
      window.localStorage.setItem("accesstoken", sessionToken);
    });
    if (res.data) {
      let _user = res.data;
      setLocalVar(_user);
      // Check extended class user role and tenentId
      try {
        const userSettings = appInfo.settings;
        const extUser = await Parse.Cloud.run("getUserDetails");
        if (extUser) {
          const IsDisabled = extUser?.get("IsDisabled") || false;
          if (!IsDisabled) {
            const userRole = extUser?.get("UserRole");
            const menu =
              userRole && userSettings.find((menu) => menu.role === userRole);
            if (menu) {
              const _currentRole = userRole;
              const redirectUrl =
                location?.state?.from || `/${menu.pageType}/${menu.pageId}`;
              const _role = _currentRole.replace("contracts_", "");
              const extInfo = JSON.parse(JSON.stringify(extUser));
              localStorage.setItem("_user_role", _role);
              localStorage.setItem("Extand_Class", JSON.stringify([extUser]));
              localStorage.setItem("userEmail", extInfo?.Email);
              localStorage.setItem("username", extInfo?.Name);
              if (extInfo?.TenantId) {
                const tenant = {
                  Id: extInfo?.TenantId?.objectId || "",
                  Name: extInfo?.TenantId?.TenantName || ""
                };
                localStorage.setItem("TenantId", tenant?.Id);
                dispatch(showTenant(tenant?.Name));
                localStorage.setItem("TenantName", tenant?.Name);
              }
              localStorage.setItem("PageLanding", menu.pageId);
              localStorage.setItem("defaultmenuid", menu.menuId);
              localStorage.setItem("pageType", menu.pageType);
              navigate(redirectUrl);
            } else {
              showToast("danger", t("role-not-found"));
              logOutUser();
            }
          } else {
            showToast("danger", t("do-not-access-contact-admin"));
            logOutUser();
          }
        } else {
          showToast("danger", t("user-not-found"));
          logOutUser();
        }
      } catch (error) {
        console.error("err in fetching extUser", err);
        showToast("danger", `${err.message}`);
        const payload = { sessionToken: _user.sessionToken };
        handleSubmitbtn(payload);
      } finally {
        setThirdpartyLoader(false);
      }
    }
  };

  const GetLoginData = async () => {
    setState({ ...state, loading: true });
    try {
      const user = await Parse.User.become(localStorage.getItem("accesstoken"));
      const _user = user.toJSON();
      setLocalVar(_user);
      const userSettings = appInfo.settings;
      const extUser = await Parse.Cloud.run("getUserDetails");
      if (extUser) {
        const IsDisabled = extUser?.get("IsDisabled") || false;
        if (!IsDisabled) {
          const userRole = extUser.get("UserRole");
          const _currentRole = userRole;
          const menu =
            userRole && userSettings.find((menu) => menu.role === userRole);
          if (menu) {
            const extInfo = JSON.parse(JSON.stringify(extUser));
            const _role = _currentRole.replace("contracts_", "");
            localStorage.setItem("_user_role", _role);
            const redirectUrl =
              location?.state?.from || `/${menu.pageType}/${menu.pageId}`;
            localStorage.setItem("Extand_Class", JSON.stringify([extUser]));
            localStorage.setItem("userEmail", extInfo.Email);
            localStorage.setItem("username", extInfo.Name);
            if (extInfo?.TenantId) {
              const tenant = {
                Id: extInfo?.TenantId?.objectId || "",
                Name: extInfo?.TenantId?.TenantName || ""
              };
              localStorage.setItem("TenantId", tenant?.Id);
              dispatch(showTenant(tenant?.Name));
              localStorage.setItem("TenantName", tenant?.Name);
            }
            localStorage.setItem("PageLanding", menu.pageId);
            localStorage.setItem("defaultmenuid", menu.menuId);
            localStorage.setItem("pageType", menu.pageType);
            navigate(redirectUrl);
          } else {
            setState({ ...state, loading: false });
            logOutUser();
          }
        } else {
          showToast("danger", t("do-not-access-contact-admin"));
          logOutUser();
        }
      } else {
        showToast("danger", t("user-not-found"));
        logOutUser();
      }
    } catch (error) {
      showToast("danger", t("something-went-wrong-mssg"));
      console.log("err", error);
    }
  };

  const togglePasswordVisibility = () => {
    setState({ ...state, passwordVisible: !state.passwordVisible });
  };

  const handleSubmitbtn = async (e) => {
    e.preventDefault();
    if (userDetails.Destination && userDetails.Company) {
      setThirdpartyLoader(true);
      const payload = { sessionToken: localStorage.getItem("accesstoken") };
      const userInformation = JSON.parse(
        localStorage.getItem("UserInformation")
      );
      if (payload && payload.sessionToken) {
        const params = {
          userDetails: {
            name: userInformation.name,
            email: userInformation.email,
            phone: userInformation?.phone || "",
            role: "contracts_User",
            company: userDetails.Company,
            jobTitle: userDetails.Destination,
            timezone: usertimezone
          }
        };
        const userSignUp = await Parse.Cloud.run("usersignup", params);
        if (userSignUp && userSignUp.sessionToken) {
          const LocalUserDetails = {
            name: userInformation.name,
            email: userInformation.email,
            phone: userInformation?.phone || "",
            company: userDetails.Company,
            jobTitle: userDetails.JobTitle
          };
          localStorage.setItem("userDetails", JSON.stringify(LocalUserDetails));
          thirdpartyLoginfn(userSignUp.sessionToken);
        } else {
          alert(userSignUp.message);
        }
      } else if (
        payload &&
        payload.message.replace(/ /g, "_") === "Internal_server_err"
      ) {
        alert(t("server-error"));
      }
    } else {
      showToast("warning", t("fill-required-details!"));
    }
  };

  const logOutUser = async () => {
    setIsModal(false);
    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("Err while logging out", err);
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
  };

  const continueLoginFlow = async () => {
    try {
      const userSettings = appInfo.settings;
      const extUser = await Parse.Cloud.run("getUserDetails");
      if (extUser) {
        const IsDisabled = extUser?.get("IsDisabled") || false;
        if (!IsDisabled) {
          const userRole = extUser?.get("UserRole");
          const menu =
            userRole && userSettings?.find((menu) => menu.role === userRole);
          if (menu) {
            const _currentRole = userRole;
            const redirectUrl =
              location?.state?.from || `/${menu.pageType}/${menu.pageId}`;
            const _role = _currentRole.replace("contracts_", "");
            localStorage.setItem("_user_role", _role);
            const checkLanguage = extUser?.get("Language");
            if (checkLanguage) {
              checkLanguage && i18n.changeLanguage(checkLanguage);
            }
            const extInfo = JSON.parse(JSON.stringify(extUser));
            // Continue with storing user data and redirecting
            localStorage.setItem("Extand_Class", JSON.stringify([extUser]));
            localStorage.setItem("userEmail", extInfo.Email);
            localStorage.setItem("username", extInfo.Name);
            if (extInfo?.TenantId) {
              const tenant = {
                Id: extInfo?.TenantId?.objectId || "",
                Name: extInfo?.TenantId?.TenantName || ""
              };
              localStorage.setItem("TenantId", tenant?.Id);
              dispatch(showTenant(tenant?.Name));
              localStorage.setItem("TenantName", tenant?.Name);
            }
            localStorage.setItem("PageLanding", menu.pageId);
            localStorage.setItem("defaultmenuid", menu.menuId);
            localStorage.setItem("pageType", menu.pageType);
            setState({ ...state, loading: false });
            navigate(redirectUrl);
          } else {
            setState({ ...state, loading: false });
            setIsModal(true);
          }
        } else {
          showToast("danger", t("do-not-access-contact-admin"));
          logOutUser();
        }
      } else {
        showToast("danger", t("user-not-found"));
        logOutUser();
      }
    } catch (error) {
      console.error("Error during login flow", error);
      showToast("danger", error.message || t("something-went-wrong-mssg"));
    }
  };

  const [isLoginView, setIsLoginView] = useState(true);
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    phone: "",
    jobTitle: ""
  });
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    caseDigit: false,
    specialChar: false
  });

  const handleSignUpChange = (e) => {
    let { name, value } = e.target;
    if (name === "email") {
      value = value?.toLowerCase()?.replace(/\s/g, "");
    }
    setSignUpData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordCriteria({
        length: value.length >= 8,
        caseDigit: /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value),
        specialChar: /[!@#$%^&*()\-_=+{};:,<.>]/.test(value)
      });
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    console.log("Signup process started");

    if (!emailRegex.test(signUpData.email)) {
      showToast("warning", t("valid-email-alert"));
      return;
    }

    // Check password criteria if needed, currently optional but logic exists
    // if (!passwordCriteria.length || !passwordCriteria.caseDigit || !passwordCriteria.specialChar) {
    //  showToast("warning", "Password does not meet requirements");
    //  return;
    // }

    setState((prevState) => ({ ...prevState, loading: true }));
    try {
      const params = {
        userDetails: {
          name: signUpData.name,
          email: signUpData.email,
          password: signUpData.password,
          phone: signUpData.phone,
          company: signUpData.company,
          jobTitle: signUpData.jobTitle,
          role: "contracts_Admin",
          timezone: usertimezone
        }
      };

      console.log("Calling usersignup Cloud Function");
      const userSignUp = await Parse.Cloud.run("usersignup", params);
      console.log("usersignup response:", userSignUp);

      if (userSignUp && userSignUp.sessionToken) {
        const LocalUserDetails = {
          name: signUpData.name,
          email: signUpData.email,
          phone: signUpData?.phone || "",
          company: signUpData.company,
          jobTitle: signUpData.jobTitle
        };
        localStorage.setItem("userDetails", JSON.stringify(LocalUserDetails));

        // Auto login after signup
        // await thirdpartyLoginfn(userSignUp.sessionToken);
        setState((prevState) => ({ ...prevState, loading: false }));
        showToast("success", t("sign-up-successfully"));
        setIsLoginView(true);
      } else {
        if (userSignUp?.message) {
          showToast("danger", userSignUp.message);
        } else {
          showToast("danger", t("something-went-wrong-mssg"));
        }
        setState((prevState) => ({ ...prevState, loading: false }));
      }
    } catch (error) {
      console.error("Signup error:", error);
      showToast("danger", error.message || t("something-went-wrong-mssg"));
      setState((prevState) => ({ ...prevState, loading: false }));
    }
  };

  return errMsg ? (
    <div className="h-screen flex justify-center text-center items-center p-4 text-gray-500 text-base">
      {errMsg}
    </div>
  ) : (
    <>
      {state.loading && (
        <div
          aria-live="assertive"
          className="fixed w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-50"
        >
          <Loader />
        </div>
      )}
      {appInfo && appInfo.appId ? (
        <>
          <div
            aria-labelledby="loginHeading"
            role="region"
            className="pb-1 md:pb-4 pt-4 md:px-10 lg:px-16 h-full flex flex-col justify-center"
          >
            <div className="md:p-4 lg:p-10 p-4 bg-base-100 text-base-content op-card max-w-6xl mx-auto w-full">
              <div className="w-[200px] h-[60px] inline-block overflow-hidden mb-4">
                {image && (
                  <img
                    src={image}
                    className="object-contain h-full"
                    alt="applogo"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Form Section */}
                <div className="w-full">
                  <div className="flex space-x-4 mb-6 border-b border-gray-200">
                    <button
                      className={`pb-2 text-lg font-medium transition-colors duration-200 ${isLoginView
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                      onClick={() => setIsLoginView(true)}
                    >
                      {t("login")}
                    </button>
                    <button
                      className={`pb-2 text-lg font-medium transition-colors duration-200 ${!isLoginView
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                      onClick={() => setIsLoginView(false)}
                    >
                      {t("create-account")}
                    </button>
                  </div>

                  {isLoginView ? (
                    <form onSubmit={handleLoginBtn} aria-label="Login Form" className="animate-fade-in-up">
                      <div className="w-full px-6 py-6 my-1 op-card bg-base-100 shadow-md outline outline-1 outline-slate-300/50 rounded-xl">
                        <label className="block text-xs font-semibold mb-1" htmlFor="email">
                          {t("email")}
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-sm mb-4"
                          name="email"
                          autoComplete="username"
                          value={state.email}
                          onChange={handleChange}
                          required
                          onInvalid={(e) =>
                            e.target.setCustomValidity(t("input-required"))
                          }
                          onInput={(e) => e.target.setCustomValidity("")}
                          placeholder={t("enter-email")}
                        />

                        <label className="block text-xs font-semibold mb-1" htmlFor="password">
                          {t("password")}
                        </label>
                        <div className="relative mb-2">
                          <input
                            id="password"
                            type={
                              state.passwordVisible ? "text" : "password"
                            }
                            className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-sm pr-10"
                            name="password"
                            value={state.password}
                            autoComplete="current-password"
                            onChange={handleChange}
                            onInvalid={(e) =>
                              e.target.setCustomValidity(
                                t("input-required")
                              )
                            }
                            onInput={(e) => e.target.setCustomValidity("")}
                            required
                            placeholder={t("enter-password")}
                          />
                          <span
                            className="absolute cursor-pointer top-[50%] right-[10px] -translate-y-[50%] text-gray-500"
                            onClick={togglePasswordVisibility}
                          >
                            {state.passwordVisible ? (
                              <i className="fa-regular fa-eye-slash" />
                            ) : (
                              <i className="fa-regular fa-eye" />
                            )}
                          </span>
                        </div>

                        <div className="flex justify-end mb-6">
                          <NavLink
                            to="/forgetpassword"
                            className="text-xs text-primary hover:text-primary-focus font-medium"
                          >
                            {t("forgot-password")}?
                          </NavLink>
                        </div>

                        <button
                          type="submit"
                          className="op-btn op-btn-primary w-full shadow-lg"
                          disabled={state.loading}
                        >
                          {state.loading ? (
                            <>
                              <Loader className="w-4 h-4 mr-2" />
                              {t("loading")}
                            </>
                          ) : t("login")}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleSignUpSubmit} className="animate-fade-in-up">
                      <div className="w-full px-6 py-6 my-1 op-card bg-base-100 shadow-md outline outline-1 outline-slate-300/50 rounded-xl space-y-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1">{t("name")} <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="name"
                            required
                            className="op-input op-input-bordered op-input-sm w-full text-sm"
                            value={signUpData.name}
                            onChange={handleSignUpChange}
                            placeholder={t("enter-name")}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">{t("email")} <span className="text-red-500">*</span></label>
                          <input
                            type="email"
                            name="email"
                            required
                            className="op-input op-input-bordered op-input-sm w-full text-sm"
                            value={signUpData.email}
                            onChange={handleSignUpChange}
                            placeholder={t("enter-email")}
                            autoComplete="username"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold mb-1">{t("Department")} <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="company"
                              required
                              className="op-input op-input-bordered op-input-sm w-full text-sm"
                              value={signUpData.company}
                              onChange={handleSignUpChange}
                              placeholder={t("Department")}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">{t("job-title")} <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="jobTitle"
                              required
                              className="op-input op-input-bordered op-input-sm w-full text-sm"
                              value={signUpData.jobTitle}
                              onChange={handleSignUpChange}
                              placeholder={t("job-title")}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">{t("phone")}</label>
                          <input
                            type="tel"
                            name="phone"
                            className="op-input op-input-bordered op-input-sm w-full text-sm"
                            value={signUpData.phone}
                            onChange={handleSignUpChange}
                            placeholder={t("phone-optional")}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1">{t("password")} <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input
                              type={state.passwordVisible ? "text" : "password"}
                              name="password"
                              required
                              className="op-input op-input-bordered op-input-sm w-full text-sm pr-10"
                              value={signUpData.password}
                              onChange={handleSignUpChange}
                              placeholder={t("create-password")}
                              autoComplete="new-password"
                            />
                            <span
                              className="absolute cursor-pointer top-[50%] right-[10px] -translate-y-[50%] text-gray-500"
                              onClick={togglePasswordVisibility}
                            >
                              {state.passwordVisible ? (
                                <i className="fa-regular fa-eye-slash" />
                              ) : (
                                <i className="fa-regular fa-eye" />
                              )}
                            </span>
                          </div>
                          {signUpData.password && (
                            <div className="mt-2 grid grid-cols-1 gap-1 text-[10px] text-gray-500">
                              <div className={passwordCriteria.length ? "text-green-600" : ""}>
                                <i className={`fa-solid ${passwordCriteria.length ? "fa-check-circle" : "fa-circle-dot"} mr-1`} />
                                {t("password-length")}
                              </div>
                              <div className={passwordCriteria.caseDigit ? "text-green-600" : ""}>
                                <i className={`fa-solid ${passwordCriteria.caseDigit ? "fa-check-circle" : "fa-circle-dot"} mr-1`} />
                                {t("password-case")}
                              </div>
                              <div className={passwordCriteria.specialChar ? "text-green-600" : ""}>
                                <i className={`fa-solid ${passwordCriteria.specialChar ? "fa-check-circle" : "fa-circle-dot"} mr-1`} />
                                {t("password-special-char")}
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="op-btn op-btn-primary w-full shadow-lg mt-4"
                          disabled={state.loading}
                        >
                          {state.loading ? (
                            <>
                              <Loader className="w-4 h-4 mr-2" />
                              {t("creating-account")}
                            </>
                          ) : t("signup")}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Image Section */}
                {width >= 768 && (
                  <div className="hidden md:flex flex-col items-center justify-center h-full pt-10">
                    <img
                      src={login_img}
                      alt="Login Illustration"
                      className="max-w-full h-auto drop-shadow-xl"
                      style={{ maxHeight: "400px" }}
                    />
                    <div className="mt-8 text-center max-w-sm">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{isLoginView ? t("welcome-back") : t("join-us-today")}</h3>
                      <p className="text-sm text-gray-500">
                        {isLoginView
                          ? "Securely sign and manage your documents with ease."
                          : "Create your account to start sending and signing documents securely."
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {state.alertMsg && (
              <Alert type={state.alertType}>{state.alertMsg}</Alert>
            )}
          </div>
          <ModalUi
            isOpen={isModal}
            title={t("additional-info")}
            showClose={false}
          >
            {/* Modal content remains same if needed for existing flows */}
            <form className="px-4 py-3 text-base-content">
              {/* ... (keep existing modal form for edge cases) ... */}
              <div className="mb-3">
                <label className="block text-xs font-semibold">{t("company")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="op-input op-input-bordered op-input-sm w-full text-xs"
                  value={userDetails.Company}
                  onChange={(e) => setUserDetails({ ...userDetails, Company: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold">{t("job-title")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="op-input op-input-bordered op-input-sm w-full text-xs"
                  value={userDetails.Destination}
                  onChange={(e) => setUserDetails({ ...userDetails, Destination: e.target.value })}
                  required
                />
              </div>
              <div className="mt-4 gap-2 flex flex-row">
                <button type="button" className="op-btn op-btn-primary" onClick={(e) => handleSubmitbtn(e)}>{t("login")}</button>
                <button type="button" className="op-btn op-btn-ghost" onClick={logOutUser}>{t("cancel")}</button>
              </div>
            </form>
          </ModalUi>
        </>
      ) : (
        <div className="fixed w-full h-full flex justify-center items-center z-50">
          <Loader />
        </div>
      )}
    </>
  );
}
export default Login;
