export const T_BOND_CONTRACT_ADDRESS = "0x51dCb56174957bd6e8e2cFA76e5081fa8eFc0787"
export const USDC_CONTRACT_ADDRESS = "0x9e190a3FFfA34E513DD65741D2DaEa1CBf5Ca39C" // Updated USDC mock address

// Export the USDC ABI for use in other components
export const USDC_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
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

