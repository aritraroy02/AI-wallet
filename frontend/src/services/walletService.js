import { ethers } from 'ethers';

let provider = null;
let signer = null;

export const connectWallet = async () => {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create provider and signer
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.formatEther(balance);

    return {
      success: true,
      walletInfo: {
        address,
        balance: parseFloat(formattedBalance).toFixed(4),
        provider,
        signer
      }
    };
  } catch (error) {
    console.error('Wallet connection failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getWalletInfo = async () => {
  try {
    if (typeof window.ethereum === 'undefined') {
      return null;
    }

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      return null;
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.formatEther(balance);

    return {
      address,
      balance: parseFloat(formattedBalance).toFixed(4),
      provider,
      signer
    };
  } catch (error) {
    console.error('Failed to get wallet info:', error);
    return null;
  }
}