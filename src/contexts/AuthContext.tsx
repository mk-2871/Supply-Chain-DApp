"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAccount, useConnect, useDisconnect, useEnsName, useChainId, useSwitchChain } from "wagmi"
import { useReadContract } from "wagmi"
import { injected } from "wagmi/connectors"
import { contractAddress } from "../config/wagmi"
import { contractAbi } from "../config/contractAbi"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"

export type UserRole = "ADMIN" | "SELLER" | "USER"

interface AuthContextType {
  address: string | undefined
  ensName: string | null
  isConnected: boolean
  isConnecting: boolean
  chainId: number | undefined
  chainName: string
  role: UserRole
  connect: () => void
  disconnect: () => void
  switchChain: (chainId: number) => void
  isChainSupported: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Role constants matching the smart contract
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000"
const SELLER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6" // keccak256("SELLER_ROLE")

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole>("USER")

  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect: connectWallet, isPending: isConnecting } = useConnect()
  const { disconnect: disconnectWallet } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Check if user has admin role
  const { data: isAdmin } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: "hasRole",
    args: [DEFAULT_ADMIN_ROLE, address],
    query: {
      enabled: isConnected && !!address,
    },
  })

  // Check if user has seller role
  const { data: isSeller } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: "hasRole",
    args: [SELLER_ROLE, address],
    query: {
      enabled: isConnected && !!address,
    },
  })

  // Determine user role based on contract responses
  useEffect(() => {
    if (!isConnected || !address) {
      setRole("USER")
      return
    }

    if (isAdmin) {
      setRole("ADMIN")
    } else if (isSeller) {
      setRole("SELLER")
    } else {
      setRole("USER")
    }
  }, [isAdmin, isSeller, isConnected, address])

  // Redirect based on role
  useEffect(() => {
    if (isConnected) {
      if (role === "ADMIN") {
        navigate("/admin")
      } else if (role === "SELLER") {
        navigate("/seller")
      } else {
        navigate("/user")
      }
    }
  }, [role, isConnected, navigate])

  // Connect wallet function
  const connect = async () => {
    try {
      await connectWallet({ connector: injected() })
    } catch (error) {
      toast.error("Failed to connect wallet")
      console.error(error)
    }
  }

  // Disconnect wallet function
  const disconnect = () => {
    disconnectWallet()
    navigate("/")
  }

  // Switch chain function
  const switchChainFn = (chainId: number) => {
    if (switchChain) {
      switchChain({ chainId })
    }
  }

  // Get chain name based on chainId
  const getChainName = () => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet"
      case 137:
        return "Polygon"
      case 10:
        return "Optimism"
      case 42161:
        return "Arbitrum"
      case 11155111:
        return "Sepolia"
      default:
        return "Unknown Network"
    }
  }

  // Get chain name
  const chainName = getChainName()

  // Check if current chain is supported
  const isChainSupported = !!chainId

  return (
    <AuthContext.Provider
      value={{
        address,
        ensName,
        isConnected,
        isConnecting,
        chainId,
        chainName,
        role,
        connect,
        disconnect,
        switchChain: switchChainFn,
        isChainSupported,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
