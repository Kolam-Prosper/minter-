import { ethers } from "ethers"
import { T_BOND_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS, USDC_ABI } from "./constants"

// ABI for the UAE T-Bond contract
const T_BOND_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "uri",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "tokensOfOwner",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "getTokensOfOwner",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

// Define a type for token metadata
interface TokenMetadata {
  name: string
  description: string
  price: string
  id: number
  ascii_art?: string
  ascii_art_url?: string
  [key: string]: unknown // For any additional properties
}

export async function getUSDCBalance(provider: ethers.BrowserProvider, address: string): Promise<string> {
  try {
    const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, provider)
    const balance = await usdcContract.balanceOf(address)
    // USDC typically has 6 decimals
    return ethers.formatUnits(balance, 6)
  } catch (error) {
    console.error("Error fetching USDC balance:", error)
    throw error
  }
}

export async function getTokenMetadata(provider: ethers.BrowserProvider, tokenId: number): Promise<TokenMetadata> {
  console.log("Fetching metadata for token ID:", tokenId)

  try {
    const contract = new ethers.Contract(T_BOND_CONTRACT_ADDRESS, T_BOND_ABI, provider)

    try {
      const tokenURI = await contract.uri(tokenId)
      console.log("Token URI:", tokenURI)

      // Check if the URI is a JSON string or a URL
      if (tokenURI.startsWith("{")) {
        // Parse the JSON directly since it's returned as a JSON string from the contract
        try {
          const metadata = JSON.parse(tokenURI) as TokenMetadata
          console.log("Parsed metadata:", metadata)
          return metadata
        } catch (parseError) {
          console.error("Error parsing token URI as JSON:", parseError)
          throw new Error("Invalid token metadata format")
        }
      } else if (tokenURI.startsWith("http") || tokenURI.startsWith("ipfs")) {
        // It's a URL, we would need to fetch it
        console.log("Token URI is a URL, would need to fetch:", tokenURI)
        // For now, return fallback with the URL
        return {
          name: `UAE T-Bond #${tokenId}`,
          description: "U.A.E T-Bonds",
          price: "1000 USDC",
          id: tokenId,
          ascii_art_url: tokenURI,
        }
      } else {
        // It's some other format, return as is
        return {
          name: `UAE T-Bond #${tokenId}`,
          description: "U.A.E T-Bonds",
          price: "1000 USDC",
          id: tokenId,
          ascii_art: tokenURI,
        }
      }
    } catch (uriError) {
      console.error("Error calling uri() function:", uriError)

      // Try tokenURI as an alternative (some contracts use this instead)
      try {
        const tokenURI = await contract.tokenURI(tokenId)
        console.log("Token URI (from tokenURI):", tokenURI)

        // Process the URI as above
        if (tokenURI.startsWith("{")) {
          const metadata = JSON.parse(tokenURI) as TokenMetadata
          console.log("Parsed metadata:", metadata)
          return metadata
        } else {
          return {
            name: `UAE T-Bond #${tokenId}`,
            description: "U.A.E T-Bonds",
            price: "1000 USDC",
            id: tokenId,
            ascii_art_url: tokenURI,
          }
        }
      } catch (tokenURIError) {
        console.error("Error calling tokenURI() function:", tokenURIError)
        throw uriError // Throw the original error
      }
    }
  } catch (error) {
    console.error("Error fetching token metadata from contract:", error)
    // Return fallback metadata
    return {
      name: `UAE T-Bond #${tokenId}`,
      description: "U.A.E T-Bonds",
      price: "1000 USDC",
      id: tokenId,
      ascii_art_url:
        "https://moccasin-tiny-ladybug-156.mypinata.cloud/ipfs/bafkreiglbolyndhc3o2baekajhph4wtvcwh42uzsuw4fawuc7vbiggdwja",
    }
  }
}

export async function getTokensOfOwner(provider: ethers.BrowserProvider, owner: string): Promise<number[]> {
  console.log("Fetching tokens for owner:", owner)

  try {
    const contract = new ethers.Contract(T_BOND_CONTRACT_ADDRESS, T_BOND_ABI, provider)

    // Try getTokensOfOwner first
    try {
      console.log("Calling getTokensOfOwner function...")
      const tokenIds = await contract.getTokensOfOwner(owner)
      console.log("Raw token IDs:", tokenIds)

      // Convert BigInt to regular numbers
      const result = tokenIds.map((id: bigint) => Number(id))
      console.log("Processed token IDs:", result)
      return result
    } catch (getTokensError) {
      console.log("getTokensOfOwner failed, trying tokensOfOwner instead...")
      console.error("getTokensOfOwner error:", getTokensError)

      // Try tokensOfOwner as fallback
      const tokenIds = await contract.tokensOfOwner(owner)
      console.log("Raw token IDs from tokensOfOwner:", tokenIds)

      // Convert BigInt to regular numbers
      const result = tokenIds.map((id: bigint) => Number(id))
      console.log("Processed token IDs:", result)
      return result
    }
  } catch (error) {
    console.error("Error fetching tokens of owner:", error)

    // Add more detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return []
  }
}

export async function approveUSDC(provider: ethers.BrowserProvider, amount: number): Promise<void> {
  console.log("Approving USDC for amount:", amount)

  const signer = await provider.getSigner()
  const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, signer)

  try {
    // First check if we have any USDC balance
    const address = await signer.getAddress()
    const balance = await usdcContract.balanceOf(address)
    console.log("USDC Balance:", ethers.formatUnits(balance, 6), "USDC")

    if (balance === 0n) {
      throw new Error("You don't have any USDC tokens. Please get some test USDC first.")
    }

    // Calculate the amount in USDC (with 6 decimals)
    // USDC typically has 6 decimals, so 1 USDC = 1,000,000 units
    const pricePerToken = 1000 * 10 ** 6 // 1000 USDC with 6 decimals
    const totalAmount = BigInt(pricePerToken) * BigInt(amount)

    console.log("Approving total amount:", totalAmount.toString())

    // Try with a smaller amount first for testing
    const testAmount = BigInt(1000000) // 1 USDC
    console.log("Testing with smaller amount first:", testAmount.toString())

    const tx = await usdcContract.approve(T_BOND_CONTRACT_ADDRESS, testAmount)
    console.log("Approval transaction sent:", tx.hash)

    await tx.wait()
    console.log("Approval transaction confirmed")
  } catch (error) {
    console.error("Detailed approval error:", error)
    throw error
  }
}

export async function mintTokens(provider: ethers.BrowserProvider, to: string, amount: number): Promise<void> {
  console.log("Minting tokens to:", to, "amount:", amount)

  const signer = await provider.getSigner()
  const contract = new ethers.Contract(T_BOND_CONTRACT_ADDRESS, T_BOND_ABI, signer)

  const tx = await contract.mint(to, amount)
  console.log("Mint transaction sent:", tx.hash)

  await tx.wait()
  console.log("Mint transaction confirmed")
}

