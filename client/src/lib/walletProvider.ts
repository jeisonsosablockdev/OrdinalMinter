
import * as React from "react";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  signTransaction: (txData: any) => Promise<string | null>;
  isYoursInstalled: () => boolean;
}

const defaultContext: WalletState = {
  isConnected: false,
  address: null,
  connectWallet: async () => false,
  disconnectWallet: () => {},
  signTransaction: async () => null,
  isYoursInstalled: () => false
};

const WalletContext = React.createContext(defaultContext);

export function useWallet() {
  return React.useContext(WalletContext);
}

interface Props {
  children: React.ReactNode;
}

declare global {
  interface Window {
    yours?: {
      isConnected: () => Promise<boolean>;
      requestAccounts: () => Promise<string[]>;
      getAccounts: () => Promise<string[]>;
      signTransaction: (txData: any) => Promise<string>;
    };
  }
}

export function WalletProvider({ children }: Props) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [address, setAddress] = React.useState<string | null>(null);

  const isYoursInstalled = () => {
    return typeof window !== "undefined" && 
           typeof window.yours !== "undefined" && 
           typeof window.yours.isConnected === "function";
  };

  const connectWallet = async (): Promise<boolean> => {
    if (!isYoursInstalled()) {
      window.open("https://yours.org/", "_blank");
      return false;
    }

    try {
      const accounts = await window.yours!.requestAccounts();
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        return true;
      }
      throw new Error("No accounts returned from wallet");
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      if (error instanceof Error) {
        throw new Error(`Wallet connection failed: ${error.message}`);
      }
      throw new Error("Wallet connection failed. Please ensure Yours Wallet is unlocked and try again.");
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
  };

  const signTransaction = async (txData: any): Promise<string | null> => {
    if (!isConnected || !isYoursInstalled()) {
      return null;
    }

    try {
      return await window.yours!.signTransaction(txData);
    } catch (error) {
      console.error("Error signing transaction:", error);
      return null;
    }
  };

  React.useEffect(() => {
    const checkConnection = async () => {
      if (isYoursInstalled()) {
        try {
          const isWalletConnected = await window.yours!.isConnected();
          if (isWalletConnected) {
            const accounts = await window.yours!.getAccounts();
            if (accounts && accounts.length > 0) {
              setAddress(accounts[0]);
              setIsConnected(true);
            }
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
    {
      value: {
        isConnected,
        address,
        connectWallet,
        disconnectWallet,
        signTransaction,
        isYoursInstalled
      }
    },
    children
  );
}
