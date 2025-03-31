import * as React from "react";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  signTransaction: (txData: any) => Promise<string | null>;
}

const defaultContext: WalletState = {
  isConnected: false,
  address: null,
  connectWallet: async () => false,
  disconnectWallet: () => {},
  signTransaction: async () => null
};

const WalletContext = React.createContext(defaultContext);

export function useWallet() {
  return React.useContext(WalletContext);
}

interface Props {
  children: React.ReactNode;
}

export function WalletProvider({ children }: Props) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [address, setAddress] = React.useState<string | null>(null);

  // Check if Yours wallet is installed
  const isYoursInstalled = () => {
    return typeof window !== "undefined" && "yours" in window;
  };

  // Connect to Yours wallet
  const connectWallet = async (): Promise<boolean> => {
    if (!isYoursInstalled()) {
      console.error("Yours wallet not found. Please install Yours wallet extension.");
      return false;
    }

    try {
      // @ts-ignore - yours wallet is injected by browser extension
      const accounts = await window.yours.requestAccounts();
      
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      return false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
  };

  // Sign transaction
  const signTransaction = async (txData: any): Promise<string | null> => {
    if (!isConnected || !isYoursInstalled()) {
      return null;
    }

    try {
      // @ts-ignore - yours wallet is injected by browser extension
      const signedTx = await window.yours.signTransaction(txData);
      return signedTx;
    } catch (error) {
      console.error("Error signing transaction:", error);
      return null;
    }
  };

  // Check if wallet is already connected on load
  React.useEffect(() => {
    const checkConnection = async () => {
      if (isYoursInstalled()) {
        try {
          // @ts-ignore - yours wallet is injected by browser extension
          const accounts = await window.yours.getAccounts();
          
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  return React.createElement(
    WalletContext.Provider,
    { value: {
      isConnected,
      address,
      connectWallet,
      disconnectWallet,
      signTransaction
    }},
    children
  );
}
