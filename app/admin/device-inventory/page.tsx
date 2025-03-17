"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, Edit2, Save, Plus, Filter } from "lucide-react"
import { getDeviceInventoryData, updateDeviceInventory, addDeviceInventory } from "@/utils/dataStorage"
import type { DeviceInventory } from "@/types/DeviceInventory"

export default function DeviceInventoryPage() {
  const [location, setLocation] = useState("")
  const router = useRouter()
  const [inventoryData, setInventoryData] = useState<DeviceInventory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedDevice, setEditedDevice] = useState<DeviceInventory | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [newDevice, setNewDevice] = useState<Omit<DeviceInventory, "id">>({
    dateOfPurchase: "",
    deviceModel: "",
    imei: "",
    vendor: "",
    costPrice: 0,
    dateOfSale: null,
    sellingPrice: null,
    notes: "",
  })

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn")
    const selectedLocation = localStorage.getItem("selectedLocation")
    if (!isLoggedIn) {
      router.push("/admin/login")
    } else if (!selectedLocation) {
      router.push("/admin/location-select")
    } else {
      setLocation(selectedLocation)
      fetchInventoryData(selectedLocation)
    }
  }, [router])

  const fetchInventoryData = (selectedLocation: string) => {
    const fetchedData = getDeviceInventoryData(selectedLocation)
    const sortedData = fetchedData.sort(
      (a, b) => new Date(b.dateOfPurchase).getTime() - new Date(a.dateOfPurchase).getTime(),
    )
    setInventoryData(sortedData)
  }

  const filteredData = inventoryData.filter((device) => {
    const matchesSearch = Object.values(device).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )
    const matchesMonth = selectedMonth
      ? new Date(device.dateOfPurchase).toLocaleString("default", { month: "long", year: "numeric" }) === selectedMonth
      : true
    return matchesSearch && matchesMonth
  })

  const handleEdit = (device: DeviceInventory) => {
    setEditingId(device.id)
    setEditedDevice({ ...device })
  }

  const handleSave = () => {
    if (editedDevice) {
      updateDeviceInventory(location, editedDevice)
      fetchInventoryData(location)
      setEditingId(null)
      setEditedDevice(null)
    }
  }

  const handleAddDevice = () => {
    const deviceWithId: DeviceInventory = {
      ...newDevice,
      id: Date.now().toString(),
    }
    addDeviceInventory(location, deviceWithId)
    fetchInventoryData(location)
    setShowAddForm(false)
    setNewDevice({
      dateOfPurchase: "",
      deviceModel: "",
      imei: "",
      vendor: "",
      costPrice: 0,
      dateOfSale: null,
      sellingPrice: null,
      notes: "",
    })
  }

  const groupByMonth = (data: DeviceInventory[]) => {
    const grouped = data.reduce(
      (acc, device) => {
        const date = new Date(device.dateOfPurchase)
        const monthYear = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`
        if (!acc[monthYear]) {
          acc[monthYear] = []
        }
        acc[monthYear].push(device)
        return acc
      },
      {} as Record<string, DeviceInventory[]>,
    )

    return Object.entries(grouped).sort(
      (a, b) => new Date(b[1][0].dateOfPurchase).getTime() - new Date(a[1][0].dateOfPurchase).getTime(),
    )
  }

  const uniqueMonths = Array.from(
    new Set(
      inventoryData.map((device) =>
        new Date(device.dateOfPurchase).toLocaleString("default", { month: "long", year: "numeric" }),
      ),
    ),
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-FXwex27GUXlbU1gWquCxj4JDcgu5Jh.png"
                alt="Mobile Care Logo"
                width={120}
                height={32}
              />
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Device Inventory</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">Location: {location}</span>
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="text-sm font-medium text-[rgb(126,232,194)] hover:text-[rgb(126,232,194)/0.8]"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-grow w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by any category..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-[rgb(126,232,194)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full sm:w-48 pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-[rgb(126,232,194)] appearance-none"
                >
                  <option value="">All Months</option>
                  {uniqueMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-[rgb(126,232,194)] text-white px-4 py-2 rounded-lg flex items-center whitespace-nowrap"
              >
                <Plus className="mr-2" size={20} />
                Add Device
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="mb-6 p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Add New Device</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  placeholder="Date of Purchase"
                  className="w-full p-2 border rounded"
                  value={newDevice.dateOfPurchase}
                  onChange={(e) => setNewDevice({ ...newDevice, dateOfPurchase: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Device Model"
                  className="w-full p-2 border rounded"
                  value={newDevice.deviceModel}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceModel: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="IMEI"
                  className="w-full p-2 border rounded"
                  value={newDevice.imei}
                  onChange={(e) => setNewDevice({ ...newDevice, imei: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Vendor"
                  className="w-full p-2 border rounded"
                  value={newDevice.vendor}
                  onChange={(e) => setNewDevice({ ...newDevice, vendor: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Cost Price"
                  className="w-full p-2 border rounded"
                  value={newDevice.costPrice}
                  onChange={(e) => setNewDevice({ ...newDevice, costPrice: Number.parseFloat(e.target.value) })}
                />
                <textarea
                  placeholder="Notes"
                  className="w-full p-2 border rounded"
                  value={newDevice.notes}
                  onChange={(e) => setNewDevice({ ...newDevice, notes: e.target.value })}
                />
              </div>
              <button onClick={handleAddDevice} className="mt-4 bg-[rgb(126,232,194)] text-white px-4 py-2 rounded">
                Add Device
              </button>
            </div>
          )}

          {groupByMonth(filteredData).map(([monthYear, devices]) => (
            <div key={monthYear} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{monthYear}</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date of Purchase
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Device Model
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        IMEI
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Vendor
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Cost Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date of Sale
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Selling Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Notes
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {devices.map((device) => (
                      <tr key={device.id} className={device.dateOfSale ? "bg-green-200 font-medium" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.dateOfPurchase}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {device.deviceModel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.imei}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.vendor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${device.costPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingId === device.id ? (
                            <input
                              type="date"
                              value={editedDevice?.dateOfSale || ""}
                              onChange={(e) =>
                                setEditedDevice((prev) => (prev ? { ...prev, dateOfSale: e.target.value } : null))
                              }
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            device.dateOfSale || "N/A"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingId === device.id ? (
                            <input
                              type="number"
                              value={editedDevice?.sellingPrice || ""}
                              onChange={(e) =>
                                setEditedDevice((prev) =>
                                  prev ? { ...prev, sellingPrice: Number.parseFloat(e.target.value) } : null,
                                )
                              }
                              className="w-full p-1 border rounded"
                            />
                          ) : device.sellingPrice ? (
                            `$${device.sellingPrice.toFixed(2)}`
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {editingId === device.id ? (
                            <textarea
                              value={editedDevice?.notes || ""}
                              onChange={(e) =>
                                setEditedDevice((prev) => (prev ? { ...prev, notes: e.target.value } : null))
                              }
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            device.notes
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingId === device.id ? (
                            <button onClick={handleSave} className="text-indigo-600 hover:text-indigo-900">
                              <Save className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEdit(device)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

