"use client"

import type React from "react"

import { useState } from "react"
import { useWeb3 } from "@/hooks/use-web3"
import { mintTokens, approveUSDC, getUSDCBalance } from "@/lib/contract"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CreditCard, Coins, AlertCircle, ExternalLink } from "lucide-react"

interface MintTokensProps {
  onSuccess?: () => void
}

// Maximum tokens that can be minted in a single transaction
const MAX_MINT_AMOUNT = 100

// Mock USDC faucet URL
const MOCK_USDC_FAUCET_URL = "https://mockfaucet.vercel.app/"

export function MintTokens({ onSuccess }: MintTokensProps) {
  const { provider, account } = useWeb3()
  const [amount, setAmount] = useState("1")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState<string | null>(null)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Only allow digits
    if (!/^\d*$/.test(value)) {
      return
    }

    // If the value is empty, allow it (user is clearing the input)
    if (value === "") {
      setAmount(value)
      return
    }

    // Parse the value to a number
    const numValue = Number.parseInt(value, 10)

    // Enforce the maximum limit
    if (numValue > MAX_MINT_AMOUNT) {
      setError(`Maximum mint amount is ${MAX_MINT_AMOUNT} tokens per transaction`)
      // Still update the input, but cap it at MAX_MINT_AMOUNT
      setAmount(MAX_MINT_AMOUNT.toString())
    } else {
      // Clear the error if it was previously set
      if (error === `Maximum mint amount is ${MAX_MINT_AMOUNT} tokens per transaction`) {
        setError(null)
      }
      setAmount(value)
    }
  }

  const checkBalance = async () => {
    if (!provider || !account) return

    try {
      setIsCheckingBalance(true)
      setError(null)

      const balance = await getUSDCBalance(provider, account)
      setSuccess(`Your USDC Balance: ${balance} USDC`)

      // If balance is 0, suggest getting mock USDC
      if (balance === "0.0") {
        setError("You don't have any USDC. Get some mock USDC from the faucet to continue.")
      }
    } catch (err) {
      console.error("Error checking USDC balance:", err)
      setError(err instanceof Error ? err.message : "Failed to check USDC balance. Please try again.")
    } finally {
      setIsCheckingBalance(false)
    }
  }

  const handleMintProcess = async () => {
    if (!provider || !account) return

    try {
      setIsProcessing(true)
      setError(null)
      setSuccess(null)

      const amountToMint = Number.parseInt(amount || "1")
      if (amountToMint <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      if (amountToMint > MAX_MINT_AMOUNT) {
        throw new Error(`Maximum mint amount is ${MAX_MINT_AMOUNT} tokens per transaction`)
      }

      // Step 1: Approve USDC
      setProcessingStep("Approving USDC...")
      await approveUSDC(provider, amountToMint)

      // Step 2: Mint Tokens
      setProcessingStep("Minting tokens...")
      await mintTokens(provider, account, amountToMint)

      setSuccess(`Successfully minted ${amountToMint} token(s)!`)
      setProcessingStep(null)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("Error in mint process:", err)
      setError(err instanceof Error ? err.message : "Transaction failed. Please try again.")
    } finally {
      setIsProcessing(false)
      setProcessingStep(null)
    }
  }

  const openMockUSDCFaucet = () => {
    // Open the faucet in a popup window
    const width = 800
    const height = 700
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    window.open(
      MOCK_USDC_FAUCET_URL,
      "MockUSDCFaucet",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`,
    )
  }

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Mint UAE T-Bonds</CardTitle>
            <CardDescription>Each token costs 1000 USDC</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="amount" className="text-sm font-medium flex items-center justify-between">
              <span>Amount to Mint</span>
              <span className="text-xs text-gray-500">Max: {MAX_MINT_AMOUNT}</span>
            </Label>
            <div className="flex items-center">
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className="rounded-r-none"
                min="1"
                max={MAX_MINT_AMOUNT}
              />
              <div className="bg-gray-100 px-4 py-2 border border-l-0 border-gray-200 rounded-r-md text-gray-600 font-medium">
                Tokens
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total cost:</span>
              <span className="font-medium">{Number.parseInt(amount || "0") * 1000} USDC</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={checkBalance}
              disabled={isCheckingBalance || !account || isProcessing}
              className="flex-1"
              size="sm"
            >
              {isCheckingBalance ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Balance...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Check USDC Balance
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={openMockUSDCFaucet}
              className="flex-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              size="sm"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Get Mock USDC
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-md text-sm flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-md text-sm">{success}</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button onClick={handleMintProcess} disabled={isProcessing} className="w-full" size="lg">
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {processingStep || "Processing..."}
            </>
          ) : (
            "Mint Tokens"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

