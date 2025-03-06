import { ethers } from "ethers"

export async function getTokensOfOwner(provider: ethers.BrowserProvider, owner: string): Promise<string[]> {
  // Replace with actual contract address and ABI
  const contractAddress = "0x51dCb56174957bd6e8e2cFA76e5081fa8eFc0787"
  const contractABI = [
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
  ]

  try {
    const contract = new ethers.Contract(contractAddress, contractABI, provider)
    const tokenIds = await contract.tokensOfOwner(owner)
    return tokenIds.map((tokenId: bigint) => tokenId.toString())
  } catch (error) {
    console.error("Error fetching tokens of owner:", error)
    return []
  }
}

