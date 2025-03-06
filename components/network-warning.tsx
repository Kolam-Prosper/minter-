"use client"

import { useWeb3 } from "@/hooks/use-web3"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export function NetworkWarning() {
  const { chainId, switchNetwork } = useWeb3()

  // Unichain Sepolia chainId is 1301 (0x515 in hex)
  const isCorrectNetwork = chainId === 1301

  if (isCorrectNetwork) {
    return null
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-10 w-10 text-yellow-500" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-medium text-yellow-800 mb-1">Wrong Network Detected</h3>
          <p className="text-yellow-700">Please switch to Unichain Sepolia Testnet to use this application.</p>
        </div>
        <Button onClick={switchNetwork} className="flex-shrink-0 bg-yellow-600 hover:bg-yellow-700">
          Switch Network
        </Button>
      </div>
    </div>
  )
}

