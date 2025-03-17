import "./globals.css"
import { Inter } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import type React from "react" // Added import for React

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Mobile Care Waivers",
  description: "Employee portal for Mobile Care waivers",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-FXwex27GUXlbU1gWquCxj4JDcgu5Jh.png"
                  alt="Mobile Care Logo"
                  width={150}
                  height={40}
                  priority
                />
              </Link>
              <div className="hidden md:flex space-x-8">
                <Link
                  href="/repair-waiver"
                  className="text-gray-900 hover:text-[rgb(126,232,194)] px-3 py-2 text-sm font-medium"
                >
                  Repair Waiver
                </Link>
                <Link
                  href="/purchase-waiver"
                  className="text-gray-900 hover:text-[rgb(126,232,194)] px-3 py-2 text-sm font-medium"
                >
                  Purchase Waiver
                </Link>
                <Link
                  href="/selling-waiver"
                  className="text-gray-900 hover:text-[rgb(126,232,194)] px-3 py-2 text-sm font-medium"
                >
                  Selling Waiver
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}



import './globals.css'