import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/lib/walletProvider";
import { useNotification } from "@/components/NotificationSystem";
import { ordinalService, MintCandidate } from "@/lib/ordinalService";

// Components
import AppHeader from "@/components/AppHeader";
import StatusBanner from "@/components/StatusBanner";
import MintingSection from "@/components/MintingSection";
import OrdinalViewer from "@/components/OrdinalViewer";
import CollectionGallery from "@/components/CollectionGallery";
import AppFooter from "@/components/AppFooter";
import WalletConnectModal from "@/components/WalletConnectModal";
import TransactionConfirmModal from "@/components/TransactionConfirmModal";

const COLLECTION_NAME = "Pixel Foxes";

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected, address, connectWallet } = useWallet();
  const { showNotification } = useNotification();
  
  // Modal states
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedMintCandidate, setSelectedMintCandidate] = useState<MintCandidate | null>(null);
  const [isProcessingMint, setIsProcessingMint] = useState(false);
  const [mintingStatus, setMintingStatus] = useState<"minting" | "success" | "error" | "none">("none");
  const [statusMessage, setStatusMessage] = useState<string>("");
  
  // Fetch collection stats
  const { data: collectionStats, refetch: refetchStats } = useQuery({
    queryKey: [`/api/collection/${COLLECTION_NAME}/stats`],
    queryFn: () => ordinalService.getCollectionStats(COLLECTION_NAME)
  });
  
  const handleOpenWalletModal = () => {
    if (isConnected) return;
    setIsWalletModalOpen(true);
  };
  
  const handleConnectYours = async () => {
    try {
      const connected = await connectWallet();
      
      if (connected) {
        setIsWalletModalOpen(false);
        showNotification({
          type: "success",
          title: t("notifications.walletConnected"),
          message: t("notifications.walletConnectedMessage")
        });
      } else {
        toast({
          title: t("errors.walletConnectionFailed"),
          description: t("errors.tryAgainLater"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: t("errors.walletConnectionFailed"),
        description: t("errors.tryAgainLater"),
        variant: "destructive"
      });
    }
  };
  
  const handleOpenTransactionModal = (mintCandidate: MintCandidate) => {
    setSelectedMintCandidate(mintCandidate);
    setIsTransactionModalOpen(true);
  };
  
  const handleConfirmTransaction = async () => {
    if (!isConnected || !address || !selectedMintCandidate) {
      return;
    }
    
    setIsProcessingMint(true);
    setMintingStatus("minting");
    setStatusMessage(t("statusBanner.mintingMessage"));
    
    try {
      const result = await ordinalService.mintOrdinal({
        walletAddress: address,
        ordinalId: selectedMintCandidate.ordinalId,
        txDetails: {
          fee: selectedMintCandidate.mintFee
        }
      });
      
      if (result.success && result.transaction) {
        setIsTransactionModalOpen(false);
        setMintingStatus("success");
        setStatusMessage(t("statusBanner.successMessage"));
        
        // Refresh collection stats
        refetchStats();
        
        showNotification({
          type: "success",
          title: t("notifications.transactionSubmitted"),
          message: t("notifications.transactionSubmittedMessage")
        });
      } else {
        setMintingStatus("error");
        setStatusMessage(result.message || t("statusBanner.errorMessage"));
        
        toast({
          title: t("errors.mintFailed"),
          description: result.message || t("errors.tryAgainLater"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error minting ordinal:", error);
      setMintingStatus("error");
      setStatusMessage(t("statusBanner.errorMessage"));
      
      toast({
        title: t("errors.mintFailed"),
        description: t("errors.tryAgainLater"),
        variant: "destructive"
      });
    } finally {
      setIsProcessingMint(false);
    }
  };
  
  // Reset status after a delay
  useEffect(() => {
    if (mintingStatus !== "none") {
      const timer = setTimeout(() => {
        setMintingStatus("none");
        setStatusMessage("");
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [mintingStatus]);
  
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <AppHeader onOpenWalletModal={handleOpenWalletModal} />
      
      <main className="container mx-auto px-4 py-8 lg:px-6 flex-grow">
        <StatusBanner status={mintingStatus} message={statusMessage} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <MintingSection 
            onOpenTransactionModal={handleOpenTransactionModal}
            collectionName={COLLECTION_NAME}
            collectionStats={collectionStats}
          />
          
          <OrdinalViewer 
            onConnectWallet={handleOpenWalletModal}
            mintCandidate={selectedMintCandidate}
            percentageMinted={collectionStats?.percentageMinted || 0}
            use3D={true}
          />
        </div>
        
        <CollectionGallery collectionName={COLLECTION_NAME} />
      </main>
      
      <AppFooter />
      
      <WalletConnectModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnectYours={handleConnectYours}
      />
      
      <TransactionConfirmModal 
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        mintCandidate={selectedMintCandidate}
        onConfirm={handleConfirmTransaction}
        isProcessing={isProcessingMint}
      />
    </div>
  );
};

export default Home;
