"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useReadContract, useWriteContract } from "wagmi"
import { contractAddress } from "../config/wagmi"
import { contractAbi } from "../config/contractAbi"
import { toast } from "react-hot-toast"
import { Package, Plus, ExternalLink, Check } from "lucide-react"
import { formatEther, parseEther } from "viem"

interface Material {
  id: bigint
  name: string
  description: string
  quantity: bigint
  price: bigint
  deliveryDate: bigint
  seller: string
  status: number // 0: Available, 1: In Transit, 2: Delivered
  transactionHash: string
}

const SellerDashboard = () => {
  const { address } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    description: "",
    quantity: "",
    price: "",
    deliveryDate: "",
  })

  // Get materials by seller
  const { data: materialsData = [], refetch: refetchMaterials } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: "getMaterialsBySeller",
    args: [address],
    query: {
      enabled: !!address,
    },
  })

  const materials = (materialsData as Material[]) || []

  // Add material function
  const { writeContractAsync: addMaterial } = useWriteContract()

  // Confirm delivery function
  const { writeContractAsync: confirmDelivery } = useWriteContract()

  // Handle add material
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Convert price from ETH to wei
      const priceInWei = parseEther(newMaterial.price)

      // Convert delivery date to timestamp
      const deliveryTimestamp = Math.floor(new Date(newMaterial.deliveryDate).getTime() / 1000)

      const tx = await addMaterial({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "addMaterial",
        args: [
          newMaterial.name,
          newMaterial.description,
          BigInt(newMaterial.quantity),
          priceInWei,
          BigInt(deliveryTimestamp),
        ],
      })

      toast.success("Material added successfully")

      // Reset form
      setNewMaterial({
        name: "",
        description: "",
        quantity: "",
        price: "",
        deliveryDate: "",
      })
      setShowAddForm(false)

      // Refetch materials after a delay to allow transaction to be mined
      setTimeout(() => {
        refetchMaterials()
      }, 5000)
    } catch (error) {
      console.error("Error adding material:", error)
      toast.error("Failed to add material")
    }
  }

  // Handle confirm delivery
  const handleConfirmDelivery = async (materialId: bigint) => {
    try {
      const tx = await confirmDelivery({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "confirmDelivery",
        args: [materialId],
      })

      toast.success("Delivery confirmed")

      // Refetch materials after a delay to allow transaction to be mined
      setTimeout(() => {
        refetchMaterials()
      }, 5000)
    } catch (error) {
      console.error("Error confirming delivery:", error)
      toast.error("Failed to confirm delivery")
    }
  }

  // Format timestamp to date
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  // Get status text
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Available"
      case 1:
        return "In Transit"
      case 2:
        return "Delivered"
      default:
        return "Unknown"
    }
  }

  // Get status badge color
  const getStatusBadgeClass = (status: number) => {
    switch (status) {
      case 0:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case 1:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case 2:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Get etherscan link
  const getEtherscanLink = (hash: string) => {
    // This is a simplified version - in production, you'd map chainId to the correct explorer
    return `https://etherscan.io/tx/${hash}`
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seller Panel</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5"
        >
          <Plus className="mr-2" size={16} />
          Add New Material
        </button>
      </div>

      {/* Add Material Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Material</h2>
          <form onSubmit={handleAddMaterial}>
            <div className="grid gap-4 mb-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={newMaterial.quantity}
                  onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Unit Price (ETH)
                </label>
                <input
                  type="text"
                  id="price"
                  value={newMaterial.price}
                  onChange={(e) => setNewMaterial({ ...newMaterial, price: e.target.value })}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="deliveryDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Delivery Date
                </label>
                <input
                  type="date"
                  id="deliveryDate"
                  value={newMaterial.deliveryDate}
                  onChange={(e) => setNewMaterial({ ...newMaterial, deliveryDate: e.target.value })}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  required
                ></textarea>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Add Material
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Package className="mr-2" size={24} />
            My Materials
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3">
                  Unit Price (ETH)
                </th>
                <th scope="col" className="px-6 py-3">
                  Delivery Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Transaction
                </th>
                <th scope="col" className="px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {materials.length > 0 ? (
                materials.map((material) => (
                  <tr key={Number(material.id)} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{material.name}</td>
                    <td className="px-6 py-4">{material.quantity.toString()}</td>
                    <td className="px-6 py-4">{formatEther(material.price)}</td>
                    <td className="px-6 py-4">{formatDate(material.deliveryDate)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusBadgeClass(material.status)}`}
                      >
                        {getStatusText(material.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {material.transactionHash ? (
                        <a
                          href={getEtherscanLink(material.transactionHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-400"
                        >
                          <ExternalLink size={14} className="mr-1" />
                          View
                        </a>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {material.status === 1 && (
                        <button
                          onClick={() => handleConfirmDelivery(material.id)}
                          className="flex items-center text-green-600 hover:text-green-900 dark:text-green-500 dark:hover:text-green-400"
                        >
                          <Check size={16} className="mr-1" />
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td colSpan={7} className="px-6 py-4 text-center">
                    No materials found
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

export default SellerDashboard
