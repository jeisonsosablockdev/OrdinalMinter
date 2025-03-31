import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/lib/walletProvider";
import { useToast } from "@/hooks/use-toast";
import { ordinalService, ValidationResponse, MintCandidate, TransactionStatus } from "@/lib/ordinalService";
import { useNotification } from "@/components/NotificationSystem";

interface MintingSectionProps {
  onOpenTransactionModal: (mintCandidate: MintCandidate) => void;
  collectionName: string;
  collectionStats: {
    totalSupply: number;
    remainingSupply: number;
    percentageMinted: number;
    mintFee: number;
  } | null;
}

const MintingSection: React.FC<MintingSectionProps> = ({ 
  onOpenTransactionModal,
  collectionName,
  collectionStats 
}) => {
  const { t } = useTranslation();
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const { showNotification } = useNotification();
  
  const [ordinalId, setOrdinalId] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [mintCandidate, setMintCandidate] = useState<MintCandidate | null>(null);
  const [isGettingCandidate, setIsGettingCandidate] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  
  // Get a new mint candidate when component mounts
  useEffect(() => {
    const getMintCandidate = async () => {
      if (!collectionName) return;
      
      setIsGettingCandidate(true);
      try {
        const candidate = await ordinalService.getMintCandidate(collectionName);
        setMintCandidate(candidate);
      } catch (error) {
        console.error("Error getting mint candidate:", error);
        toast({
          title: t("errors.mintCandidateError"),
          description: t("errors.tryAgainLater"),
          variant: "destructive"
        });
      } finally {
        setIsGettingCandidate(false);
      }
    };
    
    getMintCandidate();
  }, [collectionName, t, toast]);
  
  // Poll for transaction status updates
  useEffect(() => {
    if (!transactionId) return;
    
    const interval = setInterval(async () => {
      try {
        const status = await ordinalService.getTransactionStatus(transactionId);
        setTransactionStatus(status.status);
        
        if (status.status === "completed") {
          clearInterval(interval);
          showNotification({
            type: "success",
            title: t("notifications.mintSuccess"),
            message: t("notifications.mintSuccessMessage")
          });
        } else if (status.status === "failed") {
          clearInterval(interval);
          showNotification({
            type: "error",
            title: t("notifications.mintFailed"),
            message: t("notifications.mintFailedMessage")
          });
        }
      } catch (error) {
        console.error("Error getting transaction status:", error);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [transactionId, t, showNotification]);
  
  const handleValidateOrdinal = async () => {
    if (!isConnected || !address) {
      toast({
        title: t("errors.walletNotConnected"),
        description: t("errors.connectWalletToValidate"),
        variant: "destructive"
      });
      return;
    }
    
    if (!ordinalId.trim()) {
      toast({
        title: t("errors.emptyOrdinalId"),
        description: t("errors.enterOrdinalId"),
        variant: "destructive"
      });
      return;
    }
    
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const result = await ordinalService.validateOrdinal({
        ordinalId: ordinalId.trim(),
        walletAddress: address
      });
      
      setValidationResult(result);
      
      if (!result.isValid) {
        toast({
          title: t("errors.validationFailed"),
          description: result.message || t("errors.ordinalNotValid"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error validating ordinal:", error);
      toast({
        title: t("errors.validationError"),
        description: t("errors.tryAgainLater"),
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleMintClick = () => {
    if (!isConnected) {
      toast({
        title: t("errors.walletNotConnected"),
        description: t("errors.connectWalletToMint"),
        variant: "destructive"
      });
      return;
    }
    
    if (!validationResult?.isValid) {
      toast({
        title: t("errors.validationRequired"),
        description: t("errors.validateOrdinalFirst"),
        variant: "destructive"
      });
      return;
    }
    
    if (!mintCandidate) {
      toast({
        title: t("errors.noCandidateAvailable"),
        description: t("errors.tryAgainLater"),
        variant: "destructive"
      });
      return;
    }
    
    onOpenTransactionModal(mintCandidate);
  };
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };
  
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-background rounded-xl p-6 shadow-lg border border-gray-800">
        <h2 className="text-xl font-semibold mb-4">{t("mintingSection.title")}</h2>
        
        {/* Supply Stats */}

        
        {/* Ordinal Selection Form */}
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleValidateOrdinal(); }}>
          <div>
            <label htmlFor="input-ordinal" className="block text-sm font-medium text-gray-300 mb-2">
              {t("mintingSection.inputOrdinalId")}
            </label>
            <div className="flex">
              <Input
                id="input-ordinal"
                placeholder={t("mintingSection.enterOrdinalIdPlaceholder")}
                value={ordinalId}
                onChange={(e) => setOrdinalId(e.target.value)}
                className="flex-1 bg-background/80 border border-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button
                type="submit"
                variant="secondary"
                className="ml-2 px-4 py-2"
                disabled={isValidating || !isConnected}
              >
                {isValidating ? t("common.validating") : t("common.validate")}
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">{t("mintingSection.enterOrdinalIdDescription")}</p>
          </div>
          
          {/* Validation Result */}
          {validationResult?.isValid && validationResult.ordinal && (
            <div className="p-4 border border-gray-700 rounded-lg bg-background/80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-300">{t("mintingSection.validationResult")}</h3>
                <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">
                  {t("common.verified")}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                  <img 
                    src={validationResult.ordinal.imageUrl} 
                    alt="Ordinal Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-white font-mono">{validationResult.ordinal.ordinalId}</p>
                  <p className="text-xs text-gray-400">
                    {t("common.collection")}: {validationResult.ordinal.collectionName}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <h3 className="block text-sm font-medium text-gray-300 mb-2">
              {t("mintingSection.newOrdinalToMint")}
            </h3>
            <div className="p-4 border border-gray-700 rounded-lg bg-background/80">
              {mintCandidate ? (
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                    <img 
                      src={mintCandidate.imageUrl}
                      alt="New Ordinal Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-white">{mintCandidate.name}</p>
                    <p className="text-xs text-gray-400 mb-2">
                      {t("common.collection")}: {mintCandidate.collectionName}
                    </p>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 mr-2">{t("common.mintFee")}:</span>
                      <span className="text-sm text-primary font-medium">
                        {formatNumber(mintCandidate.mintFee)} sats
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24">
                  {isGettingCandidate ? (
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  ) : (
                    <p className="text-gray-400">{t("mintingSection.noOrdinalAvailable")}</p>
                  )}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">{t("mintingSection.mintToWalletDescription")}</p>
          </div>
          
          <div className="pt-4">
            <Button
              type="button"
              className="w-full bg-primary text-gray-900 font-semibold py-3 px-4 rounded-md hover:bg-opacity-90 transition-all flex items-center justify-center"
              onClick={handleMintClick}
              disabled={!isConnected || !validationResult?.isValid || !mintCandidate || isGettingCandidate}
            >
              <span className="material-icons mr-2">add_circle</span>
              {t("mintingSection.mintOrdinal")}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Transaction Status Card */}
      {transactionId && (
        <div className="bg-background rounded-xl p-6 shadow-lg border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">{t("transaction.status")}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="material-icons text-white text-lg">check</span>
              </div>
              <div>
                <h3 className="text-white font-medium">{t("transaction.submitted")}</h3>
                <p className="text-sm text-gray-400">{t("transaction.submittedDesc")}</p>
              </div>
            </div>
            
            <div className="ml-4 pl-4 border-l border-gray-700">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full ${transactionStatus === "processing" || transactionStatus === "completed" ? "bg-blue-500" : "bg-gray-700"} flex items-center justify-center`}>
                  {transactionStatus === "processing" ? (
                    <span className="material-icons text-white text-lg">hourglass_top</span>
                  ) : transactionStatus === "completed" ? (
                    <span className="material-icons text-white text-lg">check</span>
                  ) : (
                    <span className="material-icons text-white text-lg">hourglass_empty</span>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium">{t("transaction.processing")}</h3>
                  <p className="text-sm text-gray-400">
                    {transactionStatus === "processing" ? t("transaction.waitingConfirmation") : 
                     transactionStatus === "completed" ? t("transaction.confirmed") : 
                     t("transaction.pending")}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="ml-4 pl-4 border-l border-gray-700">
              <div className={`flex items-center space-x-3 ${transactionStatus !== "completed" ? "opacity-50" : ""}`}>
                <div className={`w-8 h-8 rounded-full ${transactionStatus === "completed" ? "bg-green-500" : "bg-gray-700"} flex items-center justify-center`}>
                  <span className="material-icons text-white text-lg">inventory_2</span>
                </div>
                <div>
                  <h3 className="text-white font-medium">{t("transaction.mintingComplete")}</h3>
                  <p className="text-sm text-gray-400">{t("transaction.mintingCompleteDesc")}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-800 mt-4">
              <div className="text-sm">
                <span className="text-gray-400">{t("transaction.txId")}:</span>
                <a 
                  href={`https://blockchair.com/bitcoin-sv/transaction/${transactionId}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 font-mono break-all hover:underline"
                >
                  {transactionId}
                </a>
              </div>
              <div className="text-sm mt-1">
                <span className="text-gray-400">{t("transaction.explorer")}:</span>
                <a 
                  href={`https://blockchair.com/bitcoin-sv/transaction/${transactionId}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline ml-1"
                >
                  {t("transaction.viewOnExplorer")}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MintingSection;
