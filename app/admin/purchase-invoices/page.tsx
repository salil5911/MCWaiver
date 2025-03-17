"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Edit2, Save, X } from "lucide-react"
import { getPurchaseInvoiceData, addPurchaseInvoiceData, updatePurchaseInvoiceData } from "@/utils/dataStorage"

type PurchaseInvoice = {
  id: number
  invoiceNumber: string
  vendor: string
  date: string
  amount: number
  notes: string
  paid: boolean
  paymentMode: string
}

export default function PurchaseInvoices() {
  const [location, setLocation] = useState("")
  const router = useRouter()
  const [purchaseInvoiceData, setPurchaseInvoiceData] = useState<PurchaseInvoice[]>([] as PurchaseInvoice[])
  const [filteredData, setFilteredData] = useState<PurchaseInvoice[]>([])
  const [vendorFilter, setVendorFilter] = useState("")
  const [monthFilter, setMonthFilter] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editedInvoice, setEditedInvoice] = useState<PurchaseInvoice | null>(null)
  const [newInvoice, setNewInvoice] = useState<Omit<PurchaseInvoice, "id">>({
    invoiceNumber: "",
    vendor: "",
    date: "",
    amount: 0,
    notes: "",
    paid: false,
    paymentMode: "",
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
      fetchPurchaseInvoiceData(selectedLocation)
    }
  }, [router])

  const fetchPurchaseInvoiceData = useCallback(async (selectedLocation: string) => {
    try {
      const data = await getPurchaseInvoiceData(selectedLocation)
      console.log("Fetched data:", data)
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setPurchaseInvoiceData(sortedData)
      setFilteredData(sortedData)
    } catch (error) {
      console.error("Error fetching purchase invoice data:", error)
      setPurchaseInvoiceData([])
      setFilteredData([])
    }
  }, [])

  useEffect(() => {
    const dataToFilter = Array.isArray(purchaseInvoiceData) ? purchaseInvoiceData : []
    let filtered = [...dataToFilter]

    if (vendorFilter) {
      filtered = filtered.filter((invoice) => invoice.vendor.toLowerCase().includes(vendorFilter.toLowerCase()))
    }

    if (monthFilter) {
      filtered = filtered.filter((invoice) => {
        const invoiceDate = new Date(invoice.date)
        return invoiceDate.getMonth() === Number.parseInt(monthFilter) - 1
      })
    }

    setFilteredData(filtered)
  }, [purchaseInvoiceData, vendorFilter, monthFilter])

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formattedDate = new Date(newInvoice.date).toISOString().split("T")[0]
      const invoiceToAdd = { ...newInvoice, date: formattedDate }
      const updatedData = await addPurchaseInvoiceData(location, invoiceToAdd)
      const sortedData = updatedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setPurchaseInvoiceData(sortedData)
      setFilteredData(sortedData)
      setShowAddForm(false)
      setNewInvoice({
        invoiceNumber: "",
        vendor: "",
        date: "",
        amount: 0,
        notes: "",
        paid: false,
        paymentMode: "",
      })
    } catch (error) {
      console.error("Error adding new invoice:", error)
      alert("Failed to add new invoice. Please try again.")
    }
  }

  const handleEdit = (invoice: PurchaseInvoice) => {
    setEditingId(invoice.id)
    setEditedInvoice({ ...invoice })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditedInvoice(null)
  }

  const handleSave = async () => {
    if (editedInvoice) {
      try {
        const updatedData = await updatePurchaseInvoiceData(location, editedInvoice)
        const sortedData = updatedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setPurchaseInvoiceData(sortedData)
        setFilteredData(sortedData)
        setEditingId(null)
        setEditedInvoice(null)
      } catch (error) {
        console.error("Error updating invoice:", error)
        alert("Failed to update invoice. Please try again.")
      }
    }
  }

  const groupByMonth = (data: PurchaseInvoice[]) => {
    if (!data || data.length === 0) return []
    const grouped = data.reduce(
      (acc, invoice) => {
        const date = new Date(invoice.date)
        const monthYear = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`
        if (!acc[monthYear]) {
          acc[monthYear] = []
        }
        acc[monthYear].push(invoice)
        return acc
      },
      {} as Record<string, PurchaseInvoice[]>,
    )

    return Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
  }

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `purchaseInvoiceData_${location}`) {
        fetchPurchaseInvoiceData(location)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [location, fetchPurchaseInvoiceData])

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
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Purchase and Invoices</h1>
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
          <div className="mb-4 flex justify-between items-center">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Filter by vendor"
                className="border rounded p-2"
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
              />
              <select
                className="border rounded p-2"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(0, month - 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[rgb(126,232,194)] text-white p-2 rounded flex items-center"
            >
              <Plus className="mr-2" size={20} />
              Add Invoice
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddInvoice} className="mb-4 p-4 bg-white rounded shadow">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Invoice Number"
                  className="border rounded p-2"
                  value={newInvoice.invoiceNumber}
                  onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Vendor"
                  className="border rounded p-2"
                  value={newInvoice.vendor}
                  onChange={(e) => setNewInvoice({ ...newInvoice, vendor: e.target.value })}
                  required
                />
                <input
                  type="date"
                  className="border rounded p-2"
                  value={newInvoice.date}
                  onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  className="border rounded p-2"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: Number.parseFloat(e.target.value) })}
                  required
                />
                <textarea
                  placeholder="Notes"
                  className="border rounded p-2 col-span-2"
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                ></textarea>
                <div>
                  <label htmlFor="paid" className="block text-sm font-medium text-gray-700">
                    Paid
                  </label>
                  <select
                    id="paid"
                    name="paid"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[rgb(126,232,194)] focus:border-[rgb(126,232,194)] sm:text-sm rounded-md"
                    value={newInvoice.paid.toString()}
                    onChange={(e) => setNewInvoice({ ...newInvoice, paid: e.target.value === "true" })}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700">
                    Payment Mode
                  </label>
                  <select
                    id="paymentMode"
                    name="paymentMode"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[rgb(126,232,194)] focus:border-[rgb(126,232,194)] sm:text-sm rounded-md"
                    value={newInvoice.paymentMode}
                    onChange={(e) => setNewInvoice({ ...newInvoice, paymentMode: e.target.value })}
                  >
                    <option value="">Select payment mode</option>
                    <option value="Check">Check</option>
                    <option value="Zelle">Zelle</option>
                    <option value="Cash">Cash</option>
                    <option value="Wire Transfer">Wire Transfer</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="mt-4 bg-[rgb(126,232,194)] text-white p-2 rounded">
                Add Invoice
              </button>
            </form>
          )}

          {groupByMonth(filteredData).map(([monthYear, invoices]) => (
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
                        Invoice Number
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
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
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
                        Paid
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Payment Mode
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
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {editingId === invoice.id ? (
                            <input
                              type="text"
                              className="w-full border rounded p-1"
                              value={editedInvoice?.invoiceNumber}
                              onChange={(e) =>
                                setEditedInvoice((prev) => (prev ? { ...prev, invoiceNumber: e.target.value } : null))
                              }
                            />
                          ) : (
                            invoice.invoiceNumber
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingId === invoice.id ? (
                            <input
                              type="text"
                              className="w-full border rounded p-1"
                              value={editedInvoice?.vendor}
                              onChange={(e) =>
                                setEditedInvoice((prev) => (prev ? { ...prev, vendor: e.target.value } : null))
                              }
                            />
                          ) : (
                            invoice.vendor
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingId === invoice.id ? (
                            <input
                              type="date"
                              className="w-full border rounded p-1"
                              value={editedInvoice?.date}
                              onChange={(e) =>
                                setEditedInvoice((prev) => (prev ? { ...prev, date: e.target.value } : null))
                              }
                            />
                          ) : (
                            invoice.date
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingId === invoice.id ? (
                            <input
                              type="number"
                              className="w-full border rounded p-1"
                              value={editedInvoice?.amount?.toString() || ""}
                              onChange={(e) =>
                                setEditedInvoice((prev) =>
                                  prev
                                    ? { ...prev, amount: e.target.value ? Number.parseFloat(e.target.value) : 0 }
                                    : null,
                                )
                              }
                            />
                          ) : (
                            `$${invoice.amount.toFixed(2)}`
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {editingId === invoice.id ? (
                            <textarea
                              className="w-full border rounded p-1"
                              value={editedInvoice?.notes}
                              onChange={(e) =>
                                setEditedInvoice((prev) => (prev ? { ...prev, notes: e.target.value } : null))
                              }
                            />
                          ) : (
                            invoice.notes
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingId === invoice.id ? (
                            <select
                              className="w-full border rounded p-1"
                              value={editedInvoice?.paid.toString()}
                              onChange={(e) =>
                                setEditedInvoice((prev) => (prev ? { ...prev, paid: e.target.value === "true" } : null))
                              }
                            >
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : invoice.paid ? (
                            "Yes"
                          ) : (
                            "No"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingId === invoice.id ? (
                            <select
                              className="w-full border rounded p-1"
                              value={editedInvoice?.paymentMode}
                              onChange={(e) =>
                                setEditedInvoice((prev) => (prev ? { ...prev, paymentMode: e.target.value } : null))
                              }
                            >
                              <option value="">Select payment mode</option>
                              <option value="Check">Check</option>
                              <option value="Zelle">Zelle</option>
                              <option value="Cash">Cash</option>
                              <option value="Wire Transfer">Wire Transfer</option>
                            </select>
                          ) : (
                            invoice.paymentMode || "N/A"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editingId === invoice.id ? (
                            <div className="flex space-x-2">
                              <button onClick={handleSave} className="text-green-600 hover:text-green-900" title="Save">
                                <Save className="h-5 w-5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(invoice)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
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

