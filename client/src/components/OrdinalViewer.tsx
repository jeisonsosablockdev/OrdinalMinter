import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/walletProvider";
import ThreeJsViewer from "@/components/ThreeJsViewer";
import { MintCandidate } from "@/lib/ordinalService";

interface OrdinalViewerProps {
  onConnectWallet: () => void;
  mintCandidate: MintCandidate | null;
  percentageMinted: number;
  use3D?: boolean;
}

const OrdinalViewer: React.FC<OrdinalViewerProps> = ({ 
  onConnectWallet,
  mintCandidate,
  percentageMinted,
  use3D = false
}) => {
  const { t } = useTranslation();
  const { isConnected } = useWallet();
  const [is3DActive, setIs3DActive] = useState(use3D);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  // Toggle 3D view
  const toggle3DView = () => {
    setIs3DActive(prev => !prev);
  };

  return (
    <div className="bg-background rounded-xl p-6 shadow-lg border border-gray-800 h-full">
      <h2 className="text-xl font-semibold mb-4">
        {mintCandidate?.collectionName || t("viewer.pixelFoxes")}
      </h2>
      
      <div className="bg-black rounded-lg overflow-hidden aspect-square mb-4" ref={viewerRef}>
        {is3DActive && mintCandidate ? (
          <ThreeJsViewer imageUrl={mintCandidate.imageUrl} />
        ) : (
          mintCandidate ? (
            <img 
              src={mintCandidate.imageUrl} 
              alt="Ordinal Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-gray-500">{t("viewer.noOrdinalSelected")}</div>
            </div>
          )
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm text-gray-400">{t("viewer.price")}</h3>
          <p className="text-lg font-semibold">0 Free</p>
        </div>
        
        <div>
          <h3 className="text-sm text-gray-400">{t("viewer.mintFee")}</h3>
          <p className="text-lg font-semibold">
            {mintCandidate ? `${mintCandidate.mintFee.toLocaleString()} sats` : "10,000 sats"}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            className="flex-1 bg-primary text-gray-900 font-medium py-2 px-4 rounded-md hover:bg-opacity-90 transition-all"
            onClick={onConnectWallet}
          >
            {t("common.connect")}
          </Button>
          <Button
            className="flex-1 bg-background text-white font-medium py-2 px-4 rounded-md border border-gray-700 hover:bg-gray-800 transition-all"
            onClick={toggle3DView}
          >
            {is3DActive ? t("viewer.view2D") : t("viewer.view3D")}
          </Button>
        </div>
        
        <div>
          <h3 className="text-sm text-gray-400 mb-1">
            {t("viewer.minted")}: {(percentageMinted || 0).toFixed(2)}%
          </h3>
          <div className="w-full h-2 bg-background/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500" 
              style={{ width: `${percentageMinted || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdinalViewer;
