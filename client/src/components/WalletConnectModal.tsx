import * as React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../lib/walletProvider';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectYours: () => void;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ 
  isOpen, 
  onClose,
  onConnectYours
}) => {
  const { t } = useTranslation();
  const { isYoursInstalled } = useWallet();

  const handleInstallClick = () => {
    window.open("https://yours.org/", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t("walletModal.title")}</DialogTitle>
          <DialogDescription className="text-gray-300">
            {t("walletModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button
            variant="outline"
            className="w-full bg-background/80 hover:bg-gray-800 text-white p-4 rounded-lg flex items-center justify-between border border-gray-700"
            onClick={isYoursInstalled() ? onConnectYours : handleInstallClick}
          >
            <div className="flex items-center">
              <svg viewBox="0 0 100 100" className="h-8 w-8 mr-3 text-primary">
                <rect width="100" height="100" rx="20" fill="currentColor" />
                <path d="M35 30L65 30L65 40L75 40L75 70L45 70L45 60L35 60Z" fill="#333" />
              </svg>
              <span>{isYoursInstalled() ? 'Connect Yours Wallet' : 'Install Yours Wallet'}</span>
            </div>
            <span className="material-icons">
              {isYoursInstalled() ? 'arrow_forward' : 'download'}
            </span>
          </Button>
          {/* TAAL Wallet button remains, but is disabled  */}
          <Button
            variant="outline"
            className="w-full bg-background/80 hover:bg-gray-800 text-white p-4 rounded-lg flex items-center justify-between border border-gray-700"
            disabled
          >
            <div className="flex items-center">
              <svg viewBox="0 0 100 100" className="h-8 w-8 mr-3 text-blue-500">
                <rect width="100" height="100" rx="20" fill="currentColor" />
                <path d="M30 30H70V70H30V30Z" fill="#333" />
                <path d="M40 40H60V60H40V40Z" fill="white" />
              </svg>
              <span>TAAL Wallet</span>
            </div>
            <span className="material-icons">arrow_forward</span>
          </Button>
        </div>

        <p className="text-sm text-gray-400 mt-4">
          {t("walletModal.termsDescription")}
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;