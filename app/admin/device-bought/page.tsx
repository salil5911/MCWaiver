"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, Edit2, Save } from "lucide-react"
import { getDeviceBoughtData, updateDeviceBoughtNote } from "@/utils/dataStorage"

type DeviceBoughtEntry = {
  id: number
  date: string
  deviceModel: string
  firstName: string
  lastName: string
  phoneNumber: string
  imei: string
  price: string
  validIdNumber: string
  notes: string
}

export default function DeviceBought() {
  const [location, setLocation] = useState("")
  const [deviceBoughtData, setDeviceBoughtData] = useState<DeviceBoughtEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editedNote, setEditedNote] = useState("")
  const router = useRouter()

  const fetchDeviceBoughtData = useCallback((selectedLocation: string) => {
    const fetchedData = getDeviceBoughtData(selectedLocation)
    const sortedData = fetchedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setDeviceBoughtData(sortedData)
  }, [])

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn")
    const selectedLocation = localStorage.getItem("selectedLocation")
    if (!isLoggedIn) {
      router.push("/admin/login")
    } else if (!selectedLocation) {
      router.push("/admin/location-select")
    } else {
      setLocation(selectedLocation)
      fetchDeviceBoughtData(selectedLocation)
    }
  }, [router, fetchDeviceBoughtData])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `phoneBoughtData_${location}`) {
        fetchDeviceBoughtData(location)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [location, fetchDeviceBoughtData])

  const filteredData = deviceBoughtData.filter((entry) =>
    Object.values(entry).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleEditNote = (id: number, note: string) => {
    setEditingId(id)
    setEditedNote(note)
  }

  const handleSaveNote = async (id: number) => {
    await updateDeviceBoughtNote(location, id, editedNote)
    fetchDeviceBoughtData(location)
    setEditingId(null)
  }

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
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Device Bought</h1>
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
          <div className="mb-4 flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by name, device, date, IMEI, or notes..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-[rgb(126,232,194)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
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
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Phone
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
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Valid ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.deviceModel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${entry.firstName} ${entry.lastName}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.imei}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.validIdNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {editingId === entry.id ? (
                        <div className="flex items-center">
                          <textarea
                            value={editedNote}
                            onChange={(e) => setEditedNote(e.target.value)}
                            className="w-full p-2 border rounded"
                            rows={3}
                          />
                          <button
                            onClick={() => handleSaveNote(entry.id)}
                            className="ml-2 p-1 text-[rgb(126,232,194)] hover:text-[rgb(126,232,194)/0.8]"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="mr-2">{entry.notes}</span>
                          <button
                            onClick={() => handleEditNote(entry.id, entry.notes)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

