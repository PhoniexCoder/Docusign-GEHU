import React from "react";
import { useNavigate } from "react-router";
import { openInNewTab } from "../../constant/Utils";
import { useTranslation } from "react-i18next";

const DashboardButton = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  function openReport() {
    if (props.Data && props.Data.Redirect_type) {
      const Redirect_type = props.Data.Redirect_type;
      const id = props.Data.Redirect_id;
      if (Redirect_type === "Form") {
        navigate(`/form/${id}`);
      } else if (Redirect_type === "Report") {
        navigate(`/report/${id}`);
      } else if (Redirect_type === "Url") {
        openInNewTab(id);
      }
    }
  }
  return (
    <button
      onClick={() => openReport()}
      className={`${props.Data && props.Data.Redirect_type
        ? "cursor-pointer"
        : "cursor-default"
        } flex items-center gap-2 px-4 py-2.5 rounded-xl text-base-content/70 hover:text-black hover:bg-base-200 opensigndark:hover:text-white opensigndark:hover:bg-gradient-primary hover:shadow-md opensigndark:hover:shadow-primary/20 transition-all duration-300 group`}
    >
      <i
        className={`${props.Icon ? props.Icon : "fa-light fa-info"} text-lg group-hover:scale-110 transition-transform duration-300`}
      ></i>
      <span className="font-medium text-sm whitespace-nowrap hidden md:inline-block">
        {t(`sidebar.${props.Label}`)}
      </span>
      {/* Mobile only icon-only view usually, but keeping text for now as flexible */}
    </button>
  );
};

export default DashboardButton;
