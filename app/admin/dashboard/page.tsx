"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Smartphone, ShoppingCart, Store, Clipboard, FileText } from "lucide-react"

const locations = [
  "Augusta",
  "Perimeter",
  "Cumberland",
  "Southlake",
  "Lynnhaven (Kiosk 1)",
  "Lynnhaven (Kiosk 2)",
  "Lynnhaven (Store)",
  "Carolina Place",
]

export default function AdminDashboard() {
  const [location, setLocation] = useState("")
  const router = useRouter()
  const [showLocationSelect, setShowLocationSelect] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn")
    const selectedLocation = localStorage.getItem("selectedLocation")
    if (!isLoggedIn) {
      router.push("/admin/login")
    } else if (!selectedLocation) {
      router.push("/admin/location-select")
    } else {
      setLocation(selectedLocation)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn")
    localStorage.removeItem("selectedLocation")
    router.push("/admin/login")
  }

  const handleLocationChange = (newLocation: string) => {
    localStorage.setItem("selectedLocation", newLocation)
    setLocation(newLocation)
    setShowLocationSelect(false)
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
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center">
              <Link
                href="/"
                className="mr-4 text-sm font-medium text-[rgb(126,232,194)] hover:text-[rgb(126,232,194)/0.8]"
              >
                Home
              </Link>
              <span className="mr-4 text-gray-600">Location: {location}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-[rgb(126,232,194)] hover:text-[rgb(126,232,194)/0.8]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-gray-900">Select a Sheet</h2>
          <button
            onClick={() => setShowLocationSelect(true)}
            className="px-6 py-3 bg-[rgb(126,232,194)] text-white rounded-lg hover:bg-[rgb(126,232,194)/0.8] transition-colors duration-300"
          >
            Change Location
          </button>
        </div>
        {showLocationSelect && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
              <h3 className="text-xl font-semibold mb-4">Select Location</h3>
              <select
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[rgb(126,232,194)]"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowLocationSelect(false)}
                className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SheetLink
            href="/admin/repair-status"
            icon={Smartphone}
            title="Repair Status"
            description="View and manage device repair statuses"
          />
          <SheetLink
            href="/admin/device-bought"
            icon={ShoppingCart}
            title="Device Bought"
            description="Track purchased devices"
          />
          <SheetLink href="/admin/device-sold" icon={Store} title="Device Sold" description="Monitor sold devices" />
          <SheetLink
            href="/admin/device-inventory"
            icon={Clipboard}
            title="Device Inventory"
            description="Manage device inventory"
          />
          <SheetLink
            href="/admin/purchase-invoices"
            icon={FileText}
            title="Purchase and Invoices"
            description="View purchase orders and invoices"
          />
        </div>
      </main>
    </div>
  )
}

function SheetLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="block p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-2 border-[rgb(126,232,194)]"
    >
      <div className="flex items-center">
        <Icon className="h-12 w-12 text-[rgb(126,232,194)]" />
        <div className="ml-4">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-base text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  )
}

