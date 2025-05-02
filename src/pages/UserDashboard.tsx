"use client"

import { useState, useEffect } from "react"
import { useReadContract } from "wagmi"
import { contractAddress } from "../config/wagmi"
import { contractAbi } from "../config/contractAbi"
import { Package, Download, Filter } from "lucide-react"
import { formatEther } from "viem"

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

interface FilterOptions {
  seller: string
  status: number[]
  deliveryDateStart: string
  deliveryDateEnd: string
}

const UserDashboard = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    seller: "",
    status: [0, 1, 2], // All statuses by default
    deliveryDateStart: "",
    deliveryDateEnd: "",
  })
  const [uniqueSellers, setUniqueSellers] = useState<string[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])

  // Get all materials
  const { data: materialsData = [] } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: "getAllMaterials",
  })

  const materials = (materialsData as Material[]) || []

  // Extract unique sellers
  useEffect(() => {
    if (materials.length > 0) {
      const sellers = Array.from(new Set(materials.map((m) => m.seller)))
      setUniqueSellers(sellers)
    }
  }, [materials])

  // Apply filters
  useEffect(() => {
    let filtered = [...materials]

    // Filter by seller
    if (filters.seller) {
      filtered = filtered.filter((m) => m.seller.toLowerCase() === filters.seller.toLowerCase())
    }

    // Filter by status
    if (filters.status.length > 0 && filters.status.length < 3) {
      filtered = filtered.filter((m) => filters.status.includes(m.status))
    }

    // Filter by delivery date range
    if (filters.deliveryDateStart) {
      const startTimestamp = Math.floor(new Date(filters.deliveryDateStart).getTime() / 1000)
      filtered = filtered.filter((m) => Number(m.deliveryDate) >= startTimestamp)
    }

    if (filters.deliveryDateEnd) {
      const endTimestamp = Math.floor(new Date(filters.deliveryDateEnd).getTime() / 1000)
      filtered = filtered.filter((m) => Number(m.deliveryDate) <= endTimestamp)
    }

    setFilteredMaterials(filtered)
  }, [materials, filters])

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

  // Handle status filter change
  const handleStatusChange = (status: number) => {
    setFilters((prev) => {
      const newStatus = [...prev.status]
      const index = newStatus.indexOf(status)

      if (index > -1) {
        newStatus.splice(index, 1)
      } else {
        newStatus.push(status)
      }

      return { ...prev, status: newStatus }
    })
  }

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = ["ID", "Name", "Description", "Quantity", "Price (ETH)", "Delivery Date", "Seller", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredMaterials.map((m) =>
        [
          m.id.toString(),
          `"${m.name.replace(/"/g, '""')}"`,
          `"${m.description.replace(/"/g, '""')}"`,
          m.quantity.toString(),
          formatEther(m.price),
          formatDate(m.deliveryDate),
          m.seller,
          getStatusText(m.status),
        ].join(","),
      ),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "materials.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Shorten address
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Materials</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg text-sm px-4 py-2"
          >
            <Filter className="mr-2" size={16} />
            Filters
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm px-4 py-2"
          >
            <Download className="mr-2" size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Materials</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seller</label>
              <select
                value={filters.seller}
                onChange={(e) => setFilters({ ...filters, seller: e.target.value })}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Sellers</option>
                {uniqueSellers.map((seller) => (
                  <option key={seller} value={seller}>
                    {shortenAddress(seller)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Status</label>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2].map((status) => (
                  <label key={status} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => handleStatusChange(status)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                      {getStatusText(status)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Delivery Date From</label>
              <input
                type="date"
                value={filters.deliveryDateStart}
                onChange={(e) => setFilters({ ...filters, deliveryDateStart: e.target.value })}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Delivery Date To</label>
              <input
                type="date"
                value={filters.deliveryDateEnd}
                onChange={(e) => setFilters({ ...filters, deliveryDateEnd: e.target.value })}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Materials Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Package className="mr-2" size={24} />
            Materials
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredMaterials.length} of {materials.length} materials
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Description
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
                  Seller
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                  <tr key={Number(material.id)} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{material.name}</td>
                    <td className="px-6 py-4">
                      {material.description.length > 50
                        ? `${material.description.substring(0, 50)}...`
                        : material.description}
                    </td>
                    <td className="px-6 py-4">{material.quantity.toString()}</td>
                    <td className="px-6 py-4">{formatEther(material.price)}</td>
                    <td className="px-6 py-4">{formatDate(material.deliveryDate)}</td>
                    <td className="px-6 py-4">{shortenAddress(material.seller)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusBadgeClass(material.status)}`}
                      >
                        {getStatusText(material.status)}
                      </span>
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

export default UserDashboard
