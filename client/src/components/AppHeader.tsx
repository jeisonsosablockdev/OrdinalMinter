import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import FoxIcon from "@/components/ui/fox-icon";
import { useWallet } from "@/lib/walletProvider";

interface AppHeaderProps {
  onOpenWalletModal: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onOpenWalletModal }) => {
  const { t, i18n } = useTranslation();
  const { isConnected, address } = useWallet();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "es" : "en";
    i18n.changeLanguage(newLang);
  };

  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="border-b border-gray-800 bg-background px-4 py-3 lg:px-6">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 mb-3 sm:mb-0">
          <FoxIcon size={40} />
          <h1 className="text-xl font-semibold text-white">{t("header.title")}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-1.5 text-sm rounded-md bg-background border border-gray-700 text-gray-300 hover:bg-gray-800 focus:outline-none flex items-center"
            onClick={toggleLanguage}
          >
            <span className="material-icons text-sm mr-1">language</span>
            <span>{i18n.language.toUpperCase()}</span>
          </Button>
          
          {!isConnected ? (
            <Button
              variant="default"
              className="bg-primary text-gray-900 font-medium rounded-md px-4 py-2 hover:bg-opacity-90 transition flex items-center"
              onClick={onOpenWalletModal}
            >
              <span className="material-icons text-sm mr-1">account_balance_wallet</span>
              <span>{t("header.connectWallet")}</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                {t("header.connected")}
              </span>
              <span className="text-gray-300 text-sm font-mono truncate w-20">
                {shortenAddress(address || "")}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
