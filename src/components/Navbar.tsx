"use client"

import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { Sun, Moon, Copy, ExternalLink } from "lucide-react"
import { toast } from "react-hot-toast"

const Navbar = () => {
  const { address, ensName, chainName, role, isChainSupported } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success("Address copied to clipboard")
    }
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getEtherscanLink = () => {
    // This is a simplified version - in production, you'd map chainId to the correct explorer
    return `https://etherscan.io/address/${address}`
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2.5">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            Supply Chain Manager
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Chain Status */}
          {isChainSupported ? (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
              {chainName}
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
              Unsupported Network
            </span>
          )}

          {/* Role Badge */}
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded 
            ${
              role === "ADMIN"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                : role === "SELLER"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {role}
          </span>

          {/* Wallet Info */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {ensName || (address ? shortenAddress(address) : "Not Connected")}
            </span>
            {address && (
              <>
                <button
                  onClick={copyAddress}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Copy size={16} />
                </button>
                <a
                  href={getEtherscanLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ExternalLink size={16} />
                </a>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
