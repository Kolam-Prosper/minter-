"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "@/hooks/use-web3"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Banknote } from "lucide-react"
import { getTokenMetadata } from "@/lib/contract"
import { T_BOND_CONTRACT_ADDRESS } from "@/lib/constants"

interface TokenDetailsProps {
  tokenId: number | null
}

interface TokenMetadata {
  name: string
  description: string
  price: string
  id: number
  ascii_art: string
  ascii_art_url?: string
}

export function TokenDetails({ tokenId }: TokenDetailsProps) {
  const { provider } = useWeb3()
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetadata() {
      if (!provider || !tokenId) return

      try {
        setLoading(true)
        setError(null)
        const data = await getTokenMetadata(provider, tokenId)
        console.log("Raw metadata:", data)

        // Create a properly typed object without using "as TokenMetadata"
        setMetadata({
          name: typeof data.name === "string" ? data.name : `UAE T-Bond #${tokenId}`,
          description: typeof data.description === "string" ? data.description : "U.A.E T-Bonds",
          price: typeof data.price === "string" ? data.price : "1000 USDC",
          id: tokenId,
          ascii_art: typeof data.ascii_art === "string" ? data.ascii_art : "",
          ascii_art_url: typeof data.ascii_art_url === "string" ? data.ascii_art_url : "",
        })
      } catch (err) {
        console.error("Error fetching token metadata:", err)
        setError("Failed to load token details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [provider, tokenId])

  if (!tokenId) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Token Selected</h3>
        <p className="text-gray-500 text-sm">Select a token from the list to view its details</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[160px]" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-red-700">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    )
  }

  if (!metadata) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{metadata.name}</h3>
          <p className="text-sm text-gray-500">Token ID: {metadata.id}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
          <p className="text-gray-900">{metadata.description}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Price</h4>
          <div className="flex items-center">
            <Banknote className="h-4 w-4 text-green-600 mr-2" />
            <p className="text-gray-900 font-medium">{metadata.price}</p>
          </div>
        </div>

        {(metadata.ascii_art || metadata.ascii_art_url) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">ASCII Art</h4>
            <div className="mt-2 p-4 bg-white rounded-md overflow-hidden border border-gray-200">
              {metadata.ascii_art ? (
                <pre className="font-mono text-xs whitespace-pre-wrap break-all">{metadata.ascii_art}</pre>
              ) : metadata.ascii_art_url ? (
                <div>
                  <p className="text-xs mb-2">ASCII Art available at URL:</p>
                  <a
                    href={metadata.ascii_art_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-xs break-all"
                  >
                    {metadata.ascii_art_url}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => window.open(`https://sepolia.uniscan.xyz/address/${T_BOND_CONTRACT_ADDRESS}`, "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View on Unichain Explorer
        </Button>
      </div>
    </div>
  )
}

