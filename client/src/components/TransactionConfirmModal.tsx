import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MintCandidate } from "@/lib/ordinalService";
import { useWallet } from "@/lib/walletProvider";

interface TransactionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  mintCandidate: MintCandidate | null;
  onConfirm: () => Promise<void>;
  isProcessing: boolean;
}

const TransactionConfirmModal: React.FC<TransactionConfirmModalProps> = ({ 
  isOpen, 
  onClose,
  mintCandidate,
  onConfirm,
  isProcessing
}) => {
  const { t } = useTranslation();
  const { address } = useWallet();
  
  // Network fee is typically smaller than mint fee
  const networkFee = mintCandidate ? Math.floor(mintCandidate.mintFee * 0.05) : 500;
  const totalFee = mintCandidate ? mintCandidate.mintFee + networkFee : 0;
  
  const handleConfirm = async () => {
    await onConfirm();
  };
  
  if (!mintCandidate) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t("transactionModal.title")}</DialogTitle>
        </DialogHeader>
        
        <div className="border border-gray-700 rounded-lg p-4 bg-background/80 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
              <img 
                src={mintCandidate.imageUrl} 
                alt="Ordinal Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm text-white">{mintCandidate.name}</p>
              <p className="text-xs text-gray-400">
                {t("common.collection")}: {mintCandidate.collectionName}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{t("common.mintFee")}</span>
              <span className="text-sm text-white">{mintCandidate.mintFee.toLocaleString()} sats</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{t("transactionModal.networkFee")}</span>
              <span className="text-sm text-white">{networkFee.toLocaleString()} sats</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-700 pt-2 mt-2">
              <span className="text-sm font-medium text-gray-300">{t("transactionModal.total")}</span>
              <span className="text-sm font-medium text-white">{totalFee.toLocaleString()} sats</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1 border border-gray-700 bg-background/80 text-white py-3 rounded-md hover:bg-gray-800 transition-all"
            onClick={onClose}
            disabled={isProcessing}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-primary text-gray-900 font-medium py-3 rounded-md hover:bg-opacity-90 transition-all"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-gray-900 border-t-transparent rounded-full"></span>
                {t("common.processing")}
              </span>
            ) : (
              t("transactionModal.confirmAndPay")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionConfirmModal;
