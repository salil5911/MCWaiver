"use client"

import type React from "react"
import { useState, useRef } from "react"
import SignaturePad from "react-signature-canvas"
import { useRouter } from "next/navigation"
import { generatePDF } from "@/utils/pdfGenerator"
import Image from "next/image"
import { saveSellingData, addDeviceSoldData } from "@/utils/dataStorage"
import type { SignaturePadRef } from "@/types/SignaturePad"

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

const SellingWaiver: React.FC = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    date: "",
    location: "",
    deviceModel: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    imei: "",
    price: "",
    validIdNo: "",
    additionalNotes: "",
  })

  const [signature, setSignature] = useState<SignaturePadRef | null>(null)
  const signaturePadRef = useRef<SignaturePadRef | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))
  }

  const handleSignaturePadRef = (ref: SignaturePadRef | null) => {
    if (ref) {
      signaturePadRef.current = ref
      setSignature(ref)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      console.log("Starting form submission...")

      // Validate signature
      if (!signaturePadRef.current) {
        throw new Error("Signature pad not initialized")
      }

      if (signaturePadRef.current.isEmpty()) {
        throw new Error("Please provide a signature before submitting")
      }

      const signatureData = signaturePadRef.current.toDataURL("image/png")
      if (!signatureData || signatureData === "data:,") {
        throw new Error("Failed to capture signature")
      }

      // Format date
      const formattedDate = new Date(formData.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })

      // Prepare form data
      const fullFormData = {
        ...formData,
        signature: signatureData,
        date: formattedDate,
      }

      console.log("Form data prepared:", { ...fullFormData, signature: "[SIGNATURE_DATA]" })

      // Save selling data
      console.log("Saving selling data...")
      await saveSellingData(fullFormData)
      console.log("Selling data saved successfully")

      // Add device sold data
      console.log("Adding device sold data...")
      await addDeviceSoldData(formData.location, {
        date: formattedDate,
        deviceModel: formData.deviceModel,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        imei: formData.imei,
        price: formData.price,
        validIdNumber: formData.validIdNo,
        notes: formData.additionalNotes,
      })
      console.log("Device sold data added successfully")

      // Generate PDF
      console.log("Generating PDF...")
      const termsAndConditions = document.getElementById("terms-and-conditions")?.innerText || ""
      await generatePDF("Selling", fullFormData, termsAndConditions)
      console.log("PDF generated successfully")

      console.log("All operations completed successfully")
      alert("Waiver submitted successfully!")

      // Small delay before navigation
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push("/")
    } catch (error) {
      console.error("Error submitting waiver:", error)
      setError(
        `An error occurred while submitting the waiver: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Rest of the component remains the same...
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-[rgb(126,232,194)] p-6 flex justify-center items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-FXwex27GUXlbU1gWquCxj4JDcgu5Jh.png"
            alt="Mobile Care Logo"
            width={150}
            height={40}
            priority
          />
        </div>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Device Selling Waiver</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          {/* Terms and conditions section */}
          <div
            id="terms-and-conditions"
            className="bg-gray-50 p-4 mb-6 max-h-60 overflow-y-auto rounded-lg shadow-inner text-sm"
          >
            <h3 className="text-lg font-semibold mb-2">Terms and Conditions</h3>
            <p className="whitespace-pre-wrap">
              {`By purchasing a device from Mobile Care, you acknowledge that you have read, understood, and agreed to the following Terms & Conditions:

1. Purchase Agreement & Condition of Sale
You, the customer, understand that Mobile Care is selling the device to you in "AS IS" condition. All devices sold by Mobile Care are certified pre-owned with original parts, unless otherwise specified by us.

2. Warranty & Customer Responsibility
2.1 Warranty Coverage
All purchased devices come with a 30-day warranty from Mobile Care.

2.2 Warranty Exclusions
If the customer damages the device, Mobile Care is not responsible for repairs or replacements. However, Mobile Care may offer a discount on repair services in such cases.

3. Carrier & Unlocking Information
All devices sold by Mobile Care are carrier-unlocked. Device unlock information is available upon request. Mobile Care is not responsible for carrier-related issues or services not provided by us.

4. Payment & Fraud Prevention
4.1 Debit/Credit Card Transactions
All debit/credit card purchases require ID verification and customer signature.

4.2 Cash Payments
All cash transactions will be checked for counterfeit currency to prevent fraudulent transactions.

5. Legal Compliance & Ethics
Mobile Care abides by all local laws and city ordinances within its operating jurisdiction. We do not tolerate:
- Dishonesty in transactions.
- Stolen or fraudulent devices.
- Forgery or misrepresentation of customer information.

Acknowledgment & Agreement
By signing below, you acknowledge that you have read, understood, and agreed to the Terms & Conditions set forth by Mobile Care.`}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block mb-1">Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
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
              <label className="block mb-1">Device Model</label>
              <input
                type="text"
                name="deviceModel"
                value={formData.deviceModel}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
              />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block mb-1">IMEI</label>
              <input
                type="text"
                name="imei"
                value={formData.imei}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block mb-1">Valid ID Number</label>
              <input
                type="text"
                name="validIdNo"
                value={formData.validIdNo}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-1">Additional Notes</label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
                rows={3}
              ></textarea>
            </div>
            <div className="col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block mb-1">Signature</label>
                <button
                  type="button"
                  onClick={() => signaturePadRef.current?.clear()}
                  className="text-sm text-[rgb(126,232,194)] hover:text-[rgb(126,232,194)/0.8]"
                >
                  Clear Signature
                </button>
              </div>
              <SignaturePad
                ref={handleSignaturePadRef}
                canvasProps={{
                  className: "w-full h-40 border rounded",
                }}
              />
            </div>
            <button
              type="submit"
              className="col-span-full bg-[rgb(126,232,194)] hover:bg-[rgb(126,232,194)/0.8] text-white font-bold py-3 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(126,232,194)] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Selling Waiver"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SellingWaiver

