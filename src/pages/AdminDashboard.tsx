"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useWriteContract, useReadContract } from "wagmi"
import { contractAddress } from "../config/wagmi"
import { contractAbi } from "../config/contractAbi"
import { toast } from "react-hot-toast"
import { Users, UserPlus, UserMinus } from "lucide-react"

// SELLER_ROLE hash
const SELLER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"

interface Seller {
  address: string
  ensName?: string
}

const AdminDashboard = () => {
  const { address } = useAuth()
  const [newSellerAddress, setNewSellerAddress] = useState("")

  // Get all sellers (this is a simplified approach - in a real app, you'd need to track all sellers)
  const { data: materialsData = [], refetch: refetchSellers } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: "getAllMaterials",
  })

  // Extract unique sellers
  const sellers = materialsData
    ? Array.from(
        new Set((materialsData as any[]).map((material) => material.seller?.toLowerCase()).filter(Boolean)),
      ).map((address) => ({ address }))
    : []

  // Grant role function
  const { writeContractAsync: grantRole } = useWriteContract()

  // Revoke role function
  const { writeContractAsync: revokeRole } = useWriteContract()

  // Handle grant role
  const handleGrantRole = async () => {
    if (!newSellerAddress) {
      toast.error("Please enter a valid address")
      return
    }

    try {
      const tx = await grantRole({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "grantRole",
        args: [SELLER_ROLE, newSellerAddress],
      })

      toast.success("Transaction submitted")

      // Reset form
      setNewSellerAddress("")

      // Refetch sellers after a delay to allow transaction to be mined
      setTimeout(() => {
        refetchSellers()
      }, 5000)
    } catch (error) {
      console.error("Error granting role:", error)
      toast.error("Failed to grant role")
    }
  }

  // Handle revoke role
  const handleRevokeRole = async (sellerAddress: string) => {
    try {
      const tx = await revokeRole({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "revokeRole",
        args: [SELLER_ROLE, sellerAddress],
      })

      toast.success("Transaction submitted")

      // Refetch sellers after a delay to allow transaction to be mined
      setTimeout(() => {
        refetchSellers()
      }, 5000)
    } catch (error) {
      console.error("Error revoking role:", error)
      toast.error("Failed to revoke role")
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Control Panel</h1>
      </div>

      {/* Grant Seller Role Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <UserPlus className="mr-2" size={24} />
          Grant Seller Role
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newSellerAddress}
            onChange={(e) => setNewSellerAddress(e.target.value)}
            placeholder="Enter wallet address"
            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
          <button
            onClick={handleGrantRole}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Grant Role
          </button>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Users className="mr-2" size={24} />
            Sellers
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Address
                </th>
                <th scope="col" className="px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sellers.length > 0 ? (
                sellers.map((seller) => (
                  <tr key={seller.address} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {seller.ensName || seller.address}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRevokeRole(seller.address)}
                        className="flex items-center text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"
                      >
                        <UserMinus className="mr-1" size={16} />
                        Revoke Role
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td colSpan={2} className="px-6 py-4 text-center">
                    No sellers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
