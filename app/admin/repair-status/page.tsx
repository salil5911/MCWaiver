"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, Edit2, Save } from "lucide-react"
import { getRepairData, updatePostInspectionNotes } from "@/utils/dataStorage"
import type { RepairFormData } from "@/types/RepairFormData"

export default function RepairStatus() {
  const [location, setLocation] = useState("")
  const [repairData, setRepairData] = useState<RepairFormData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editedNote, setEditedNote] = useState("")
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn")
    const selectedLocation = localStorage.getItem("selectedLocation")
    if (!isLoggedIn) {
      router.push("/admin/login")
    } else if (!selectedLocation) {
      router.push("/admin/location-select")
    } else {
      setLocation(selectedLocation)
      fetchRepairData(selectedLocation)
    }
  }, [router])

  const fetchRepairData = useCallback((selectedLocation: string) => {
    const fetchedData = getRepairData(selectedLocation)
    const sortedData = fetchedData
      .map((entry) => ({
        ...entry,
        warrantyExpiration:
          new Date(entry.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? "Covered" : "Expired",
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setRepairData(sortedData)
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `repairData_${location}`) {
        fetchRepairData(location)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [location, fetchRepairData])

  const filteredData = repairData.filter((entry) =>
    Object.values(entry).some((value) => value?.toString().toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleEditNote = (id: number, note: string) => {
    setEditingId(id)
    setEditedNote(note)
  }

  const handleSaveNote = async (id: number) => {
    await updatePostInspectionNotes(location, id, editedNote)
    fetchRepairData(location)
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
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Repair Status</h1>
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
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-[rgb(126,232,194)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
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
                    Customer Name
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
                    Part Repaired
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Technician
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Repair Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Warranty
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Notes
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-l min-w-[300px]"
                  >
                    Post Inspection Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((repair) => (
                  <tr key={repair.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {repair.deviceModel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${repair.firstName} ${repair.lastName}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.partBeingRepaired}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.technicianName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repair.repairAmount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          repair.warrantyExpiration === "Covered"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {repair.warrantyExpiration}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{repair.additionalNotes}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 sticky right-0 bg-white shadow-l min-w-[300px]">
                      {editingId === repair.id ? (
                        <div className="flex items-start gap-2">
                          <textarea
                            value={editedNote}
                            onChange={(e) => setEditedNote(e.target.value)}
                            className="flex-1 p-2 border rounded min-h-[80px] resize-y focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
                            placeholder="Enter post inspection notes..."
                          />
                          <button
                            onClick={() => handleSaveNote(repair.id)}
                            className="p-2 text-white bg-[rgb(126,232,194)] rounded hover:bg-[rgb(126,232,194)/0.8] transition-colors"
                            title="Save"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex-1">{repair.postInspectionNotes || "No notes"}</span>
                          <button
                            onClick={() => handleEditNote(repair.id, repair.postInspectionNotes)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Edit notes"
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

