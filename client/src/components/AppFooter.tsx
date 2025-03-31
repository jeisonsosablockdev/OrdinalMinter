import React from "react";
import { useTranslation } from "react-i18next";
import FoxIcon from "@/components/ui/fox-icon";

const AppFooter: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <FoxIcon size={32} />
              <span className="text-lg font-semibold text-white">{t("footer.title")}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              © {currentYear} {t("footer.copyright")}
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="material-icons">help_outline</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="material-icons">forum</span>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              <span className="material-icons">code</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="material-icons">language</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
