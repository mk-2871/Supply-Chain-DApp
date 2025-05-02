import { http, createConfig } from "wagmi"
import { mainnet, polygon, optimism, arbitrum, sepolia } from "wagmi/chains"
import { injected } from "wagmi/connectors"

// Get RPC URL from environment variable or use default
const rpcUrl = import.meta.env.VITE_RPC_URL || ""

// Supported chains
export const supportedChains = [mainnet, polygon, optimism, arbitrum, sepolia]

// Create wagmi config
export const config = createConfig({
  chains: supportedChains,
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(rpcUrl || undefined),
    [polygon.id]: http(rpcUrl || undefined),
    [optimism.id]: http(rpcUrl || undefined),
    [arbitrum.id]: http(rpcUrl || undefined),
    [sepolia.id]: http(rpcUrl || undefined),
  },
})

// Contract address from environment variable
export const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || ""

// Admin address from environment variable
export const adminAddress = import.meta.env.VITE_ADMIN_ADDRESS || ""
