import Image from "next/image"
import Link from "next/link"
import { Smartphone, ShoppingCart, Store, Clock, Users, Shield, LockKeyhole } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-FXwex27GUXlbU1gWquCxj4JDcgu5Jh.png"
            alt="Mobile Care Logo"
            width={300}
            height={80}
            className="mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mobile Care Employee Portal</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Welcome to the Mobile Care employee portal. Manage device repairs, purchases, and sales efficiently with our
            digital waiver system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Link
            href="/repair-waiver"
            className="group relative overflow-hidden rounded-lg border-4 border-[rgb(126,232,194)] p-6 hover:shadow-lg transition-all duration-300 bg-white"
          >
            <div className="absolute inset-0 brand-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
            <Smartphone className="h-12 w-12 mb-4 text-[rgb(126,232,194)]" />
            <h2 className="text-2xl font-semibold mb-2">Device Repair Waiver</h2>
            <p className="text-gray-600">Process device repair agreements and warranties</p>
          </Link>

          <Link
            href="/purchase-waiver"
            className="group relative overflow-hidden rounded-lg border-4 border-[rgb(126,232,194)] p-6 hover:shadow-lg transition-all duration-300 bg-white"
          >
            <div className="absolute inset-0 brand-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
            <ShoppingCart className="h-12 w-12 mb-4 text-[rgb(126,232,194)]" />
            <h2 className="text-2xl font-semibold mb-2">Device Purchase Waiver</h2>
            <p className="text-gray-600">Handle device purchase transactions and verifications</p>
          </Link>

          <Link
            href="/selling-waiver"
            className="group relative overflow-hidden rounded-lg border-4 border-[rgb(126,232,194)] p-6 hover:shadow-lg transition-all duration-300 bg-white"
          >
            <div className="absolute inset-0 brand-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
            <Store className="h-12 w-12 mb-4 text-[rgb(126,232,194)]" />
            <h2 className="text-2xl font-semibold mb-2">Device Selling Waiver</h2>
            <p className="text-gray-600">Process device sales and warranty agreements</p>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Use Our Digital Waiver System?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-16 w-16 text-[rgb(126,232,194)] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-gray-600">Streamline your workflow with our efficient digital process</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Users className="h-16 w-16 text-[rgb(126,232,194)] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Improve Customer Experience</h3>
              <p className="text-gray-600">Provide a smooth and professional service to your customers</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield className="h-16 w-16 text-[rgb(126,232,194)] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Enhance Security</h3>
              <p className="text-gray-600">Securely store and manage all your waiver documents digitally</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Mobile Care at a Glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <p className="text-4xl font-bold text-[rgb(126,232,194)]">8+</p>
              <p className="text-gray-600">Locations</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <p className="text-4xl font-bold text-[rgb(126,232,194)]">50+</p>
              <p className="text-gray-600">Expert Technicians</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <p className="text-4xl font-bold text-[rgb(126,232,194)]">1000+</p>
              <p className="text-gray-600">Repairs Monthly</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <p className="text-4xl font-bold text-[rgb(126,232,194)]">99%</p>
              <p className="text-gray-600">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 right-4">
        <Link
          href="/admin/login"
          className="flex items-center justify-center w-12 h-12 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
        >
          <LockKeyhole className="w-6 h-6" />
          <span className="sr-only">Admin Login</span>
        </Link>
      </div>
    </div>
  )
}

