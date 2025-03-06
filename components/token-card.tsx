"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "@/hooks/use-web3"
import { getTokenMetadata } from "@/lib/contract"
import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"

interface TokenCardProps {
  tokenId: number
  isSelected: boolean
  onClick: () => void
}

export function TokenCard({ tokenId, isSelected, onClick }: TokenCardProps) {
  const { provider } = useWeb3()
  const [name, setName] = useState<string>(`#${tokenId}`)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetadata() {
      if (!provider) return

      try {
        setLoading(true)
        const data = await getTokenMetadata(provider, tokenId)
        if (data.name) {
          // Just use the token ID for display to keep it compact
          setName(`#${tokenId}`)
        }
      } catch (error) {
        console.error(`Error fetching metadata for token ${tokenId}:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [provider, tokenId])

  // Generate a deterministic color based on tokenId
  const getColor = (id: number) => {
    const colors = [
      "text-blue-600 bg-blue-50",
      "text-green-600 bg-green-50",
      "text-purple-600 bg-purple-50",
      "text-amber-600 bg-amber-50",
      "text-pink-600 bg-pink-50",
      "text-indigo-600 bg-indigo-50",
    ]
    return colors[id % colors.length]
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-md border transition-all duration-200 hover:shadow-sm p-2",
        isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300",
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className={cn("w-10 h-10 rounded-md flex items-center justify-center mb-1", getColor(tokenId))}>
          {loading ? (
            <div className="animate-pulse w-6 h-6 rounded-full bg-gray-200"></div>
          ) : (
            <FileText className="h-5 w-5" />
          )}
        </div>
        <div className="font-medium text-xs truncate w-full">{name}</div>
      </div>
    </div>
  )
}

