import { useState, useEffect, Suspense } from "react";
import { lazyWithRetry } from "../../utils";
import { useTranslation } from "react-i18next";
const DashboardButton = lazyWithRetry(() => import("./DashboardButton"));
const DashboardCard = lazyWithRetry(() => import("./DashboardCard"));
const DashboardReport = lazyWithRetry(() => import("./DashboardReport"));
const buttonList = [
  {
    label: "Sign yourself",
    redirectId: "sHAnZphf69",
    redirectType: "Form",
    icon: "fa-light fa-pen-nib"
  },
  {
    label: "Request signatures",
    redirectId: "8mZzFxbG1z",
    redirectType: "Form",
    icon: "fa-light fa-paper-plane"
  }
];
const GetDashboard = (props) => {
  const { t } = useTranslation();

  const Button = ({ label, redirectId, redirectType, icon }) => (
    <div className="contents">
      <DashboardButton
        Icon={icon}
        Label={label}
        Data={{ Redirect_type: redirectType, Redirect_id: redirectId }}
      />
    </div>
  );
  const renderSwitchWithTour = (col) => {
    switch (col.widget.type) {
      case "Card":
        return (
          <div
            className={`${col?.widget?.bgColor ? col.widget.bgColor : "bg-[#2ed8b6]"
              } op-card w-full h-[140px] px-3 pt-4 mb-3 shadow-md`}
            data-tut={col.widget.data.tourSection}
          >
            <Suspense
              fallback={
                <div className="h-[150px] w-full flex justify-center items-center">
                  {t("loading")}
                </div>
              }
            >
              <DashboardCard
                Icon={col.widget.icon}
                Label={col.widget.label}
                Format={col.widget.format && col.widget.format}
                Data={col.widget.data}
                FilterData={col.widget.filter}
              />
            </Suspense>
          </div>
        );
      case "report": {
        return (
          <div data-tut={col.widget.data.tourSection}>
            <Suspense fallback={<div>please wait</div>}>
              <div className="mb-3 md:mb-0">
                <DashboardReport
                  Record={col.widget}
                />
              </div>
            </Suspense>
          </div>
        );
      }
      default:
        return <></>;
    }
  };
  const renderSwitch = (col) => {
    switch (col.widget.type) {
      case "Card":
        return (
          <div
            className="bg-base-100 op-card w-full h-[160px] p-5 mb-4 shadow-sm border border-base-200 rounded-2xl hover:shadow-md transition-shadow duration-300"
          >
            <Suspense fallback={<div>please wait</div>}>
              <DashboardCard
                Icon={col.widget.icon}
                Label={col.widget.label}
                Format={col.widget.format && col.widget.format}
                Data={col.widget.data}
                FilterData={col.widget.filter}
                BgColor={col.widget.bgColor}
              />
            </Suspense>
          </div>
        );
      case "report": {
        return (
          <Suspense fallback={<div>please wait</div>}>
            <div className="mb-3 md:mb-0">
              <DashboardReport
                Record={col.widget}
              />
            </div>
          </Suspense>
        );
      }
      default:
        return <></>;
    }
  };
  const username = localStorage.getItem("username") || "User";
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("good-morning");
    if (hour < 18) return t("good-afternoon");
    return t("good-evening");
  };

  return (
    <div className="pb-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-base-content font-outfit">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{username}</span>
            <span className="ml-2">👋</span>
          </h1>
          <p className="text-base-content/60 mt-1 text-sm md:text-base font-medium">
            {t("dashboard-welcome-subtitle", "Here's what's happening today.")}
          </p>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-base-100 p-2 rounded-2xl shadow-sm border border-base-200 flex items-center gap-2">
          {buttonList.map((btn) => (
            <Button
              key={btn.label}
              label={btn.label}
              redirectType={btn.redirectType}
              redirectId={btn.redirectId}
              icon={btn.icon}
            />
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col gap-6">

        {/* Top Row: Stats Cards */}
        <div className="grid grid-cols-12 gap-4">
          {props?.dashboard?.columns?.map((col, i) => {
            if (col.widget.type === "Card") {
              return (
                <div key={i} className={col?.colsize}>
                  {col.widget.data && col.widget.data.tourSection ? renderSwitchWithTour(col) : renderSwitch(col)}
                </div>
              )
            }
            return null;
          })}
        </div>

        {/* Bottom Row: Reports */}
        <div className="grid grid-cols-12 gap-6">
          {props?.dashboard?.columns?.map((col, i) => {
            if (col.widget.type === "report") {
              return (
                <div key={i} className={col?.colsize}>
                  {col.widget.data && col.widget.data.tourSection ? renderSwitchWithTour(col) : renderSwitch(col)}
                </div>
              )
            }
            return null;
          })}
        </div>

      </div>
    </div>
  );
};

export default GetDashboard;
