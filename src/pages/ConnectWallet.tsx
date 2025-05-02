"use client"

import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { Sun, Moon } from "lucide-react"

const ConnectWallet = () => {
  const { connect, isConnecting, isConnected } = useAuth()
  const { theme, toggleTheme } = useTheme()

  if (isConnected) {
    return null // Will be redirected by AuthContext
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="m-auto">
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Supply Chain Manager</h1>
            <button
              onClick={toggleTheme}
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm p-2.5"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Connect your wallet to access the supply chain management system.
            </p>
            <button
              onClick={connect}
              disabled={isConnecting}
              className="w-full py-2.5 px-5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg border border-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">This application requires:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>MetaMask or compatible wallet</li>
              <li>Connection to an Ethereum-compatible network</li>
              <li>Appropriate role permissions on the smart contract</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectWallet
