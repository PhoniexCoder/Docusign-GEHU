import { useEffect, useState } from "react";
import Parse from "parse";
import { appInfo } from "../constant/appinfo";
import { NavLink, useNavigate } from "react-router";
import {
  getAppLogo,
  openInNewTab,
  saveLanguageInLocal,
  usertimezone
} from "../constant/Utils";
import { useDispatch } from "react-redux";
import { showTenant } from "../redux/reducers/ShowTenant";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import { emailRegex } from "../constant/const";

const AddAdmin = () => {
  const appName =
    "DocuSign™";
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [lengthValid, setLengthValid] = useState(false);
  const [caseDigitValid, setCaseDigitValid] = useState(false);
  const [specialCharValid, setSpecialCharValid] = useState(false);
  const [isAuthorize, setIsAuthorize] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [state, setState] = useState({
    loading: false,
    alertType: "success",
    alertMsg: ""
  });
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    checkUserExist();
    // eslint-disable-next-line
  }, []);
  const checkUserExist = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const app = await getAppLogo();
      if (app?.error === "invalid_json") {
        setErrMsg(t("server-down", { appName: appName }));
      } else if (app?.user === "exist") {
        setErrMsg(t("admin-exists"));
      }
    } catch (err) {
      setErrMsg(t("something-went-wrong-mssg"));
      console.log("err in check user exist", err);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };
  const clearStorage = async () => {
    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("Err while logging out", err);
    }
    const baseUrl = localStorage.getItem("baseUrl");
    const appid = localStorage.getItem("parseAppId");
    const applogo = localStorage.getItem("appLogo");
    const defaultmenuid = localStorage.getItem("defaultmenuid");
    const PageLanding = localStorage.getItem("PageLanding");
    const userSettings = localStorage.getItem("userSettings");
    const favicon = localStorage.getItem("favicon");

    localStorage.clear();
    saveLanguageInLocal(i18n);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("userSettings", userSettings);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
    localStorage.setItem("favicon", favicon);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!emailRegex.test(email)) {
      alert(t("valid-email-alert"));
    } else {
      if (lengthValid && caseDigitValid && specialCharValid) {
        clearStorage();
        setState({ loading: true });
        const userDetails = {
          name: name,
          email: email?.toLowerCase()?.replace(/\s/g, ""),
          phone: phone,
          company: company,
          jobTitle: jobTitle
        };
        localStorage.setItem("userDetails", JSON.stringify(userDetails));
        try {
          event.preventDefault();
          const user = new Parse.User();
          user.set("name", name);
          user.set("email", email?.toLowerCase()?.replace(/\s/g, ""));
          user.set("password", password);
          user.set("phone", phone);
          user.set("username", email?.toLowerCase()?.replace(/\s/g, ""));
          const userRes = await user.save();
          if (userRes) {
            const params = {
              userDetails: {
                jobTitle: jobTitle,
                company: company,
                name: name,
                email: email?.toLowerCase()?.replace(/\s/g, ""),
                phone: phone,
                role: "contracts_Admin",
                timezone: usertimezone
              }
            };
            try {
              const usersignup = await Parse.Cloud.run("addadmin", params);
              if (usersignup) {

                handleNavigation(userRes.getSessionToken());
              }
            } catch (err) {
              alert(err.message);
              setState({ loading: false });
            }
          }
        } catch (error) {
          console.log("err ", error);
          if (error.code === 202) {
            const params = { email: email };
            const res = await Parse.Cloud.run("getUserDetails", params);
            // console.log("Res ", res);
            if (res) {
              alert(t("already-exists-this-username"));
              setState({ loading: false });
            } else {
              // console.log("state.email ", email);
              try {
                await Parse.User.requestPasswordReset(email).then(
                  async function (res) {
                    if (res.data === undefined) {
                      alert(t("verification-code-sent"));
                    }
                  }
                );
              } catch (err) {
                console.log(err);
              }
              setState({ loading: false });
            }
          } else {
            alert(error.message);
            setState({ loading: false });
          }
        }
      }
    }
  };
  const handleNavigation = async (sessionToken) => {
    const res = await Parse.User.become(sessionToken);
    if (res) {
      const _user = JSON.parse(JSON.stringify(res));
      // console.log("_user ", _user);
      localStorage.setItem("accesstoken", sessionToken);
      localStorage.setItem("UserInformation", JSON.stringify(_user));
      localStorage.setItem("accesstoken", _user.sessionToken);
      if (_user.ProfilePic) {
        localStorage.setItem("profileImg", _user.ProfilePic);
      } else {
        localStorage.setItem("profileImg", "");
      }
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
              const _role = _currentRole.replace("contracts_", "");
              localStorage.setItem("_user_role", _role);
              const extInfo_stringify = JSON.stringify([extUser]);
              localStorage.setItem("Extand_Class", extInfo_stringify);
              const extInfo = JSON.parse(JSON.stringify(extUser));
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
              setState({
                loading: false,
                alertType: "success",
                alertMsg: t("registered-user-successfully")
              });
              navigate(`/${menu.pageType}/${menu.pageId}`);
            } else {
              setState({
                loading: false,
                alertType: "danger",
                alertMsg: t("role-not-found")
              });
            }
          } else {
            setState({
              loading: false,
              alertType: "danger",
              alertMsg: t("do-not-access")
            });
          }
        }
      } catch (error) {
        console.log("error in fetch extuser", error);
        const msg = error.message || t("something-went-wrong-mssg");
        setState({ loading: false, alertType: "danger", alertMsg: msg });
      } finally {
        setTimeout(() => setState({ loading: false, alertMsg: "" }), 2000);
      }
    }
  };
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    // Check conditions separately
    setLengthValid(newPassword.length >= 8);
    setCaseDigitValid(
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword)
    );
    setSpecialCharValid(/[!@#$%^&*()\-_=+{};:,<.>]/.test(newPassword));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {state.loading ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader />
          <p className="text-gray-500 font-medium">Setting up your admin account...</p>
        </div>
      ) : (
        <div className="max-w-md w-full space-y-8">
          {errMsg ? (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="fa-solid fa-circle-exclamation text-red-400"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{errMsg}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-gray-100">
              <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                  Welcome to GEHUDOCSI
                </h2>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("name")} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("email")} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value?.toLowerCase()?.replace(/\s/g, ""))
                      }
                      onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("phone")} <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
                        onInput={(e) => e.target.setCustomValidity("")}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("company")} <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="company"
                        name="company"
                        type="text"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
                        onInput={(e) => e.target.setCustomValidity("")}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("job-title")} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="jobTitle"
                      name="jobTitle"
                      type="text"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("password")} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 pr-10"
                      value={password}
                      onChange={(e) => handlePasswordChange(e)}
                      onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
                      onInput={(e) => e.target.setCustomValidity("")}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={togglePasswordVisibility}>
                      {showPassword ? (
                        <i className="fa-regular fa-eye-slash text-gray-400 hover:text-gray-500" />
                      ) : (
                        <i className="fa-regular fa-eye text-gray-400 hover:text-gray-500" />
                      )}
                    </div>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center ${lengthValid ? "text-green-600" : "text-gray-500"}`}>
                        <i className={`fa-solid ${lengthValid ? "fa-check-circle" : "fa-circle-dot"} mr-1.5`}></i>
                        {t("password-length")}
                      </div>
                      <div className={`flex items-center ${caseDigitValid ? "text-green-600" : "text-gray-500"}`}>
                        <i className={`fa-solid ${caseDigitValid ? "fa-check-circle" : "fa-circle-dot"} mr-1.5`}></i>
                        {t("password-case")}
                      </div>
                      <div className={`flex items-center ${specialCharValid ? "text-green-600" : "text-gray-500"}`}>
                        <i className={`fa-solid ${specialCharValid ? "fa-check-circle" : "fa-circle-dot"} mr-1.5`}></i>
                        {t("password-special-char")}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="termsandcondition"
                        name="termsandcondition"
                        type="checkbox"
                        required
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                        checked={isAuthorize}
                        onChange={(e) => setIsAuthorize(e.target.checked)}
                        onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
                        onInput={(e) => e.target.setCustomValidity("")}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="termsandcondition" className="font-medium text-gray-700 cursor-pointer">
                        {t("agreee")}{" "}
                        <span
                          className="text-indigo-600 hover:text-indigo-500 underline cursor-pointer"
                          onClick={() => openInNewTab("https://www.opensignlabs.com/terms-and-conditions")}
                        >
                          {t("term")}
                        </span>
                      </label>
                    </div>
                  </div>


                </div>

                <div>
                  <button
                    type="submit"
                    disabled={state.loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {state.loading ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                        {t("loading")}
                      </>
                    ) : (
                      <>
                        {t("next")} <i className="fa-solid fa-arrow-right ml-2 mt-0.5"></i>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddAdmin;
