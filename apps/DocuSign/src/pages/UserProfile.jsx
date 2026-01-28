import React, {
  useState,
  useEffect,
} from "react";
import { Navigate, useNavigate } from "react-router";
import Parse from "parse";
import { SaveFileSize } from "../constant/saveFileSize";
import dp from "../assets/images/dp.png";
import { sanitizeFileName, withSessionValidation } from "../utils";
import axios from "axios";
import Tooltip from "../primitives/Tooltip";
import {
  getSecureUrl,
  handleSendOTP
} from "../constant/Utils";
import ModalUi from "../primitives/ModalUi";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";

import UploadThingButton from "../components/UploadThingButton";

function UserProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  let UserProfile =
    localStorage.getItem("UserInformation") &&
    JSON.parse(localStorage.getItem("UserInformation"));
  let extendUser =
    localStorage.getItem("Extand_Class") &&
    JSON.parse(localStorage.getItem("Extand_Class"));
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [editmode, setEditMode] = useState(false);
  const [name, SetName] = useState(localStorage.getItem("username"));
  const [Phone, SetPhone] = useState(UserProfile && UserProfile.phone);
  const [Image, setImage] = useState(localStorage.getItem("profileImg"));
  const [isLoader, setIsLoader] = useState(false);
  const [percentage, setpercentage] = useState(0);
  const [company, setCompany] = useState(
    extendUser && extendUser?.[0]?.Company
  );
  const [jobTitle, setJobTitle] = useState(
    extendUser && extendUser?.[0]?.JobTitle
  );
  const [isVerifyModal, setIsVerifyModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoader, setOtpLoader] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isdeleteModal, setIsdeleteModal] = useState(false);
  const [deleteUserRes, setDeleteUserRes] = useState("");
  const [isDelLoader, setIsDelLoader] = useState(false);
  useEffect(() => {
    getUserDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getUserDetail = async () => {
    setIsLoader(true);
    const currentUser = JSON.parse(JSON.stringify(Parse.User.current()));
    let isEmailVerified = currentUser?.emailVerified || false;
    if (isEmailVerified) {
      setIsEmailVerified(isEmailVerified);
      setIsLoader(false);
    } else {
      try {
        const userQuery = new Parse.Query(Parse.User);
        const user = await userQuery.get(currentUser.objectId, {
          sessionToken: localStorage.getItem("accesstoken")
        });
        if (user) {
          isEmailVerified = user?.get("emailVerified");
          setIsEmailVerified(isEmailVerified);
          setIsLoader(false);
        }
      } catch (e) {
        alert(t("something-went-wrong-mssg"));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let phn = Phone,
      res = "";
    if (!res) {
      setIsLoader(true);
      try {
        const userQuery = Parse.Object.extend("_User");
        const query = new Parse.Query(userQuery);
        await query.get(UserProfile.objectId).then((object) => {
          object.set("name", name);
          object.set("ProfilePic", Image);
          object.set("phone", phn || "");
          object.save().then(
            async (response) => {
              if (response) {
                let res = response.toJSON();
                let rr = JSON.stringify(res);
                localStorage.setItem("UserInformation", rr);
                SetName(res.name);
                SetPhone(res?.phone || "");
                setImage(res.ProfilePic);
                localStorage.setItem("username", res.name);
                localStorage.setItem("profileImg", res.ProfilePic);
                await updateExtUser({
                  Name: res.name,
                  Phone: res?.phone || ""
                });
                alert(t("profile-update-alert"));
                setEditMode(false);
                setIsLoader(false);
                //navigate("/dashboard/35KBoSgoAK");
              }
            },
            (error) => {
              alert(t("something-went-wrong-mssg"));
              console.error("Error while updating tour", error);
              setIsLoader(false);
            }
          );
        });
      } catch (error) {
        console.log("err", error);
      }
    }
  };

  //  `updateExtUser` is used to update user details in extended class
  const updateExtUser = withSessionValidation(async (obj) => {
    try {
      const extData = JSON.parse(localStorage.getItem("Extand_Class"));
      const ExtUserId = extData?.[0]?.objectId;
      const body = {
        Phone: obj?.Phone || "",
        Name: obj.Name,
        JobTitle: jobTitle,
        Company: company,
        Language: obj?.language || "",
      };

      await axios.put(
        parseBaseUrl + "classes/contracts_Users/" + ExtUserId,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": parseAppId,
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      );
      const res = await Parse.Cloud.run("getUserDetails");

      const json = JSON.parse(JSON.stringify([res]));
      const extRes = JSON.stringify(json);
      localStorage.setItem("Extand_Class", extRes);
    } catch (err) {
      console.log("error in save data in contracts_Users class", err);
    }
  });
  // file upload function
  const fileUpload = async (file) => {
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    const size = file.size;
    const pdfFile = file;
    const fileName = file.name;
    const name = sanitizeFileName(fileName);
    const parseFile = new Parse.File(name, pdfFile);

    try {
      const response = await parseFile.save({
        progress: (progressValue, loaded, total) => {
          if (progressValue !== null) {
            const percentCompleted = Math.round((loaded * 100) / total);
            // console.log("percentCompleted ", percentCompleted);
            setpercentage(percentCompleted);
          }
        }
      });
      // // The response object will contain information about the uploaded file
      // console.log("File uploaded:", response);

      if (response?.url()) {
        const fileRes = await getSecureUrl(response?.url());
        if (fileRes?.url) {
          setImage(fileRes?.url);
          setpercentage(0);
          const tenantId = localStorage.getItem("TenantId");
          const userId = extendUser?.[0]?.UserId?.objectId;
          SaveFileSize(size, fileRes?.url, tenantId, userId);
          return fileRes?.url;
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  if (
    localStorage.getItem("accesstoken") === null &&
    localStorage.getItem("pageType") === null
  ) {
    let _redirect = `/`;
    return <Navigate to={_redirect} />;
  }

  //`handleVerifyBtn` function is used to send otp on user mail
  const handleVerifyBtn = async () => {
    setIsVerifyModal(true);
    await handleSendOTP(Parse.User.current().getEmail());
  };
  const handleCloseVerifyModal = async () => {
    setIsVerifyModal(false);
  };
  //`handleVerifyEmail` function is used to verify email with otp
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setOtpLoader(true);
    try {
      const resEmail = await Parse.Cloud.run("verifyemail", {
        otp: otp,
        email: Parse.User.current().getEmail()
      });
      if (resEmail?.message === "Email is verified.") {
        setIsEmailVerified(true);
        alert(t("Email-verified-alert-1"));
      } else if (resEmail?.message === "Email is already verified.") {
        setIsEmailVerified(true);
        alert(t("Email-verified-alert-2"));
      }
      setOtp("");
      setIsVerifyModal(false);
    } catch (error) {
      alert(error.message);
    } finally {
      setOtpLoader(false);
    }
  };
  //function to use resend otp for email verification
  const handleResend = async (e) => {
    e.preventDefault();
    setOtpLoader(true);
    await handleSendOTP(Parse.User.current().getEmail());
    setOtpLoader(false);
    alert(t("otp-sent-alert"));
  };

  const handleCancel = () => {
    setEditMode(false);
    SetName(localStorage.getItem("username"));
    SetPhone(UserProfile && UserProfile.phone);
    setImage(localStorage.getItem("profileImg"));
    setCompany(extendUser && extendUser?.[0]?.Company);
    setJobTitle(extendUser?.[0]?.JobTitle);
  };

  const handleDeleteAccountBtn = () => {
    const isAdmin = extendUser?.[0]?.UserRole === "contracts_Admin";
    if (!isAdmin) {
      setDeleteUserRes(t("delete-action-prohibited"));
    }
    setIsdeleteModal(true);
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setIsDelLoader(true);
    try {
      await Parse.Cloud.run("senddeleterequest", {
        userId: Parse.User.current().id
      });
      setDeleteUserRes(t("account-deletion-request-sent-via-mail"));
    } catch (err) {
      setDeleteUserRes(err.message);
      console.log("Err in deleteuser acc", err);
    } finally {
      setIsDelLoader(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsdeleteModal(false);
    setDeleteUserRes("");
  };

  return (
    <React.Fragment>
      {isLoader ? (
        <div className="h-[100vh] flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Profile Snapshot */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-base-100 rounded-3xl shadow-sm border border-base-200 overflow-hidden relative group">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="px-6 pb-8 relative text-center">
                  {/* Avatar */}
                  <div className="relative -mt-16 mb-4 inline-block">
                    <div className="p-1.5 bg-base-100 rounded-full">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-base-100 shadow-lg">
                        <img
                          className="object-cover w-full h-full"
                          src={Image === "" ? dp : Image}
                          alt="dp"
                        />
                      </div>
                    </div>
                    {editmode && (
                      <div className="absolute bottom-2 right-2">
                        <UploadThingButton
                          endpoint="imageUploader"
                          onUploadComplete={(res) => {
                            if (res?.[0]) {
                              const fileUrl = res[0].url;
                              setImage(fileUrl);
                              const size = res[0].size;
                              const tenantId = localStorage.getItem("TenantId");
                              const userId = extendUser?.[0]?.UserId?.objectId;
                              SaveFileSize(size, fileUrl, tenantId, userId);
                            }
                          }}
                          onUploadError={(error) => alert(`ERROR! ${error.message}`)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Name & Role */}
                  <h2 className="text-2xl font-bold font-outfit text-base-content mb-1">
                    {name}
                  </h2>
                  <div className="op-badge op-badge-primary op-badge-outline mb-4">
                    {localStorage.getItem("_user_role")}
                  </div>

                  {/* Delete Account Link */}
                  <div className="mt-4 pt-4 border-t border-base-200">
                    <button
                      onClick={() => handleDeleteAccountBtn()}
                      className="text-error hover:text-error/80 text-sm font-medium transition-colors"
                    >
                      {t("delete-account")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Completion Progress if applicable */}
              {percentage !== 0 && (
                <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uploading...</span>
                    <span>{percentage}%</span>
                  </div>
                  <progress className="op-progress op-progress-primary w-full" value={percentage} max="100"></progress>
                </div>
              )}
            </div>

            {/* Right Column: Edit Form */}
            <div className="lg:col-span-8">
              <div className="bg-base-100 rounded-3xl shadow-sm border border-base-200 p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold font-outfit text-base-content">Profile Details</h3>
                    <p className="text-base-content/60 text-sm mt-1">Manage your personal information and preferences.</p>
                  </div>
                  {!editmode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="op-btn op-btn-primary op-btn-sm md:op-btn-md gap-2 rounded-xl text-white font-medium shadow-lg shadow-primary/20"
                    >
                      <i className="fa-regular fa-pen-to-square"></i> {t("edit")}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="op-form-control">
                    <label className="op-label">
                      <span className="op-label-text font-medium text-base-content/70">{t("name")}</span>
                    </label>
                    <input
                      type="text"
                      disabled={!editmode}
                      value={name}
                      onChange={(e) => SetName(e.target.value)}
                      className={`op-input op-input-bordered w-full rounded-xl px-4 focus:border-primary focus:outline-none transition-all ${!editmode ? "bg-base-200/50 border-transparent" : "bg-base-100 border-base-300"}`}
                    />
                  </div>

                  {/* Phone */}
                  <div className="op-form-control">
                    <label className="op-label">
                      <span className="op-label-text font-medium text-base-content/70">{t("phone")}</span>
                    </label>
                    <input
                      type="text"
                      disabled={!editmode}
                      value={Phone}
                      onChange={(e) => SetPhone(e.target.value)}
                      className={`op-input op-input-bordered w-full rounded-xl px-4 focus:border-primary focus:outline-none transition-all ${!editmode ? "bg-base-200/50 border-transparent" : "bg-base-100 border-base-300"}`}
                    />
                  </div>

                  {/* Company */}
                  <div className="op-form-control">
                    <label className="op-label">
                      <span className="op-label-text font-medium text-base-content/70">{t("company")}</span>
                    </label>
                    <input
                      type="text"
                      disabled={!editmode}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className={`op-input op-input-bordered w-full rounded-xl px-4 focus:border-primary focus:outline-none transition-all ${!editmode ? "bg-base-200/50 border-transparent" : "bg-base-100 border-base-300"}`}
                    />
                  </div>

                  {/* Job Title */}
                  <div className="op-form-control">
                    <label className="op-label">
                      <span className="op-label-text font-medium text-base-content/70">{t("job-title")}</span>
                    </label>
                    <input
                      type="text"
                      disabled={!editmode}
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className={`op-input op-input-bordered w-full rounded-xl px-4 focus:border-primary focus:outline-none transition-all ${!editmode ? "bg-base-200/50 border-transparent" : "bg-base-100 border-base-300"}`}
                    />
                  </div>

                  {/* Email */}
                  <div className="op-form-control md:col-span-2">
                    <label className="op-label justify-start gap-2">
                      <span className="op-label-text font-medium text-base-content/70">{t("email")}</span>
                      {editmode && (
                        <Tooltip message={t("email-help")} maxWidth="max-w-[250px]" />
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={UserProfile && UserProfile.email}
                        className="op-input op-input-bordered w-full rounded-xl px-4 bg-base-200/50 border-transparent text-base-content/60"
                      />
                      <div className="absolute top-0 right-0 h-full flex items-center pr-3">
                        {isEmailVerified ? (
                          <span className="op-badge op-badge-success op-badge-sm gap-1 text-white">
                            <i className="fa-solid fa-check"></i> {t("verified")}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerifyBtn()}
                            className="op-btn op-btn-xs op-btn-warning text-white"
                          >
                            {t("verify")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex items-center gap-3 border-t border-base-200 pt-6">
                  {editmode ? (
                    <>
                      <button
                        onClick={(e) => handleSubmit(e)}
                        className="op-btn op-btn-primary rounded-xl px-8 text-white shadow-lg shadow-primary/20"
                      >
                        {t("save-changes")}
                      </button>
                      <button
                        onClick={() => handleCancel()}
                        className="op-btn op-btn-ghost rounded-xl px-6"
                      >
                        {t("cancel")}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate("/changepassword")}
                      className="op-btn op-btn-outline op-btn-secondary rounded-xl gap-2"
                    >
                      <i className="fa-solid fa-lock"></i> {t("change-password")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modals remain mostly unchanged but wrapped properly */}
          {isdeleteModal && (
            <ModalUi
              isOpen
              title={t("delete-account")}
              handleClose={handleCloseDeleteModal}
            >
              {isDelLoader ? (
                <div className="h-[100px] flex justify-center items-center">
                  <Loader />
                </div>
              ) : (
                <>
                  {deleteUserRes ? (
                    <div className="h-[100px] p-[20px] flex justify-center items-center text-base-content text-sm md:text-base">
                      {deleteUserRes}
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleDeleteAccount(e)}>
                      <div className="px-6 py-3 text-base-content text-sm md:text-base">
                        {t("delete-account-que")}
                      </div>
                      <div className="px-6 mb-3 flex justify-end gap-2">
                        <button
                          className="op-btn op-btn-ghost"
                          onClick={handleCloseDeleteModal}
                        >
                          {t("cancel")}
                        </button>
                        <button
                          type="submit"
                          className="op-btn op-btn-primary text-white"
                        >
                          {t("yes")}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </ModalUi>
          )}

          {isVerifyModal && (
            <ModalUi
              isOpen
              title={t("otp-verification")}
              handleClose={handleCloseVerifyModal}
            >
              {otpLoader ? (
                <div className="h-[150px] flex justify-center items-center">
                  <Loader />
                </div>
              ) : (
                <form onSubmit={(e) => handleVerifyEmail(e)}>
                  <div className="px-6 py-4 text-base-content">
                    <label className="mb-2 block font-medium">{t("enter-otp")}</label>
                    <input
                      onInvalid={(e) =>
                        e.target.setCustomValidity(t("input-required"))
                      }
                      onInput={(e) => e.target.setCustomValidity("")}
                      required
                      type="tel"
                      pattern="[0-9]{4}"
                      className="input input-bordered w-full focus:outline-none"
                      placeholder={t("otp-placeholder")}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <div className="px-6 mb-4 flex justify-end gap-2">
                    <button
                      className="btn btn-ghost"
                      onClick={(e) => handleResend(e)}
                    >
                      {t("resend")}
                    </button>
                    <button type="submit" className="btn btn-primary text-white">
                      {t("verify")}
                    </button>
                  </div>
                </form>
              )}
            </ModalUi>
          )}
        </div>
      )}
    </React.Fragment>
  );
}


export default UserProfile;
