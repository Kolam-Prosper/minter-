"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "@/hooks/use-web3"
import { getTokensOfOwner } from "@/lib/contract"
import { TokenDetails } from "@/components/token-details"
import { NetworkWarning } from "@/components/network-warning"
import { MintTokens } from "@/components/mint-tokens"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TokenCard } from "@/components/token-card"

export default function Page() {
  const { provider, account, isConnected, isCorrectNetwork, connect } = useWeb3()
  const [tokens, setTokens] = useState<number[]>([])
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Add debug logging
  useEffect(() => {
    console.log("Connection status:", { isConnected, isCorrectNetwork, account })
  }, [isConnected, isCorrectNetwork, account])

  useEffect(() => {
    async function fetchTokens() {
      if (provider && account && isCorrectNetwork) {
        try {
          setLoading(true)
          console.log("Fetching tokens for account:", account)

          // Add more detailed logging
          console.log("Provider type:", provider.constructor.name)
          console.log("Account:", account)
          console.log("Network status:", isCorrectNetwork)

          const tokenIds = await getTokensOfOwner(provider, account)
          console.log("Tokens fetched:", tokenIds)

          if (Array.isArray(tokenIds)) {
            setTokens(tokenIds)
          } else {
            console.error("Unexpected response format:", tokenIds)
            setTokens([])
          }
        } catch (error) {
          console.error("Error fetching tokens:", error)
          if (error instanceof Error) {
            console.error("Error message:", error.message)
            console.error("Error stack:", error.stack)
          }
        } finally {
          setLoading(false)
        }
      }
    }

    fetchTokens()
  }, [provider, account, isCorrectNetwork])

  const handleTokenSelect = (tokenId: number) => {
    setSelectedTokenId(tokenId)
  }

  const refreshTokens = async () => {
    if (provider && account && isCorrectNetwork) {
      try {
        setLoading(true)
        const tokenIds = await getTokensOfOwner(provider, account)
        setTokens(tokenIds)
      } catch (error) {
        console.error("Error refreshing tokens:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">UAE T-Bond Platform</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your UAE Treasury Bonds on Unichain</p>
        </header>

        {!isConnected ? (
          <div className="max-w-md mx-auto mb-8">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Welcome to UAE T-Bond Platform</CardTitle>
                <CardDescription>Connect your wallet to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={connect} className="w-full" size="lg">
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="max-w-3xl mx-auto">
            <NetworkWarning />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="max-w-3xl mx-auto">
              <MintTokens onSuccess={refreshTokens} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="shadow-sm border-0 h-full">
                  <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-xl">My Tokens</CardTitle>
                    <CardDescription>Select a token to view details</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {loading ? (
                      <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : tokens.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {tokens.map((tokenId) => (
                          <TokenCard
                            key={tokenId}
                            tokenId={tokenId}
                            isSelected={selectedTokenId === tokenId}
                            onClick={() => handleTokenSelect(tokenId)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 px-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tokens found</h3>
                        <p className="text-gray-500 mb-6">Mint some tokens to get started!</p>
                        <Button variant="outline" onClick={refreshTokens} size="sm">
                          Refresh
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="shadow-sm border-0 h-full">
                  <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-xl">Token Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <TokenDetails tokenId={selectedTokenId} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

