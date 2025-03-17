"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

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

export default function LocationSelect() {
  const [selectedLocation, setSelectedLocation] = useState("")
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn")
    if (!isLoggedIn) {
      router.push("/admin/login")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedLocation) {
      localStorage.setItem("selectedLocation", selectedLocation)
      router.push("/admin/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-FXwex27GUXlbU1gWquCxj4JDcgu5Jh.png"
          alt="Mobile Care Logo"
          width={150}
          height={40}
          className="mx-auto mb-6"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Select Location</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <select
                id="location"
                name="location"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[rgb(126,232,194)] focus:border-[rgb(126,232,194)] sm:text-sm rounded-md"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                required
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[rgb(126,232,194)] hover:bg-[rgb(126,232,194)/0.8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(126,232,194)]"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

