import React from "react";
import { useTranslation } from "react-i18next";

interface StatusBannerProps {
  status: "minting" | "success" | "error" | "none";
  message?: string;
}

const StatusBanner: React.FC<StatusBannerProps> = ({ status, message }) => {
  const { t } = useTranslation();
  
  if (status === "none") {
    return null;
  }
  
  const bannerClasses = {
    minting: "border-primary",
    success: "border-green-500",
    error: "border-red-500"
  };
  
  const titles = {
    minting: t("statusBanner.minting"),
    success: t("statusBanner.success"),
    error: t("statusBanner.error")
  };
  
  const defaultMessages = {
    minting: t("statusBanner.mintingMessage"),
    success: t("statusBanner.successMessage"),
    error: t("statusBanner.errorMessage")
  };
  
  const icons = {
    minting: (
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    ),
    success: (
      <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
        <span className="material-icons text-white">check</span>
      </div>
    ),
    error: (
      <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
        <span className="material-icons text-white">error</span>
      </div>
    )
  };
  
  return (
    <div className={`mb-8 rounded-lg bg-background p-4 border-l-4 ${bannerClasses[status]}`}>
      <div className="flex items-center">
        <div className="mr-4">
          {icons[status]}
        </div>
        <div>
          <h3 className="font-medium text-white">{titles[status]}</h3>
          <p className="text-gray-400 text-sm">{message || defaultMessages[status]}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusBanner;
