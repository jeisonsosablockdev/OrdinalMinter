
import { act, renderHook } from '@testing-library/react';
import { useWallet, WalletProvider } from '../walletProvider';

describe('WalletProvider', () => {
  beforeEach(() => {
    // Mock the window.yours object
    window.yours = {
      isConnected: jest.fn(),
      requestAccounts: jest.fn(),
      getAccounts: jest.fn(),
      signTransaction: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete window.yours;
  });

  it('should detect if Yours wallet is installed', () => {
    const { result } = renderHook(() => useWallet(), {
      wrapper: WalletProvider,
    });

    expect(result.current.isYoursInstalled()).toBe(true);
  });

  it('should detect if Yours wallet is not installed', () => {
    delete window.yours;
    
    const { result } = renderHook(() => useWallet(), {
      wrapper: WalletProvider,
    });

    expect(result.current.isYoursInstalled()).toBe(false);
  });

  it('should connect to wallet successfully', async () => {
    const mockAccounts = ['0x123'];
    window.yours!.requestAccounts = jest.fn().mockResolvedValue(mockAccounts);
    window.yours!.isConnected = jest.fn().mockResolvedValue(true);

    const { result } = renderHook(() => useWallet(), {
      wrapper: WalletProvider,
    });

    await act(async () => {
      await result.current.connectWallet();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.address).toBe(mockAccounts[0]);
  });

  it('should handle connection failure', async () => {
    window.yours!.requestAccounts = jest.fn().mockRejectedValue(new Error('Connection failed'));

    const { result } = renderHook(() => useWallet(), {
      wrapper: WalletProvider,
    });

    await expect(result.current.connectWallet()).rejects.toThrow('Wallet connection failed: Connection failed');
  });

  it('should handle empty accounts array', async () => {
    window.yours!.requestAccounts = jest.fn().mockResolvedValue([]);

    const { result } = renderHook(() => useWallet(), {
      wrapper: WalletProvider,
    });

    await expect(result.current.connectWallet()).rejects.toThrow('No accounts returned from wallet');
  });
});
