"use client"

import type React from "react"

import { useState, useEffect, useCallback, createContext, useContext } from "react"
import { ethers } from "ethers"

declare global {
  interface Window {
    ethereum: any
  }
}

interface Web3ContextType {
  provider: ethers.BrowserProvider | null
  account: string | null
  chainId: number | null
  isConnected: boolean
  isCorrectNetwork: boolean
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  account: null,
  chainId: null,
  isConnected: false,
  isCorrectNetwork: false,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null)
          setIsConnected(false)
        } else {
          setAccount(accounts[0])
          setIsConnected(true)
        }
      })

      // Listen for chain changes
      window.ethereum.on("chainChanged", async () => {
        const provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(provider)
        const network = await provider.getNetwork()
        const chainIdValue = Number(network.chainId)
        setChainId(chainIdValue)
        setIsCorrectNetwork(chainIdValue === 1301) // Unichain Sepolia chainId
      })

      // Check if already connected
      provider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0].address)
          setIsConnected(true)
        }
      })

      // Get current chain
      provider.getNetwork().then((network) => {
        const chainIdValue = Number(network.chainId)
        setChainId(chainIdValue)
        setIsCorrectNetwork(chainIdValue === 1301) // Unichain Sepolia chainId
        console.log("Current chainId:", chainIdValue)
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [])

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!")
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      setAccount(accounts[0])
      setIsConnected(true)

      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      const network = await provider.getNetwork()
      const chainIdValue = Number(network.chainId)
      setChainId(chainIdValue)
      setIsCorrectNetwork(chainIdValue === 1301) // Unichain Sepolia chainId
    } catch (error) {
      console.error("Error connecting to wallet:", error)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAccount(null)
    setIsConnected(false)
  }, [])

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!")
      return
    }

    try {
      console.log("Switching to Unichain Sepolia (chainId: 0x515)")
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x515" }], // 0x515 is hex for 1301 (Unichain Sepolia)
      })

      // Force refresh network status
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()
      const chainIdValue = Number(network.chainId)
      setChainId(chainIdValue)
      setIsCorrectNetwork(chainIdValue === 1301)
      console.log("Network switched, new chainId:", chainIdValue)
    } catch (error: any) {
      console.error("Error switching network:", error)

      // This error code means the chain has not been added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x515", // 1301 in hex
                chainName: "Unichain Sepolia",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.sepolia.unichain.org"],
                blockExplorerUrls: ["https://sepolia.uniscan.xyz"],
              },
            ],
          })

          // Try switching again after adding
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x515" }],
          })

          // Refresh network status
          const provider = new ethers.BrowserProvider(window.ethereum)
          const network = await provider.getNetwork()
          const chainIdValue = Number(network.chainId)
          setChainId(chainIdValue)
          setIsCorrectNetwork(chainIdValue === 1301)
        } catch (addError) {
          console.error("Error adding network:", addError)
        }
      }
    }
  }, [])

  return (
    <Web3Context.Provider
      value={{
        provider,
        account,
        chainId,
        isConnected,
        isCorrectNetwork,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  return useContext(Web3Context)
}

