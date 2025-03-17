"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import SignaturePad from "react-signature-canvas"
import { useRouter } from "next/navigation"
import { generatePDF } from "@/utils/pdfGenerator"
import Image from "next/image"
import { saveRepairData } from "@/utils/dataStorage"
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

const techniciansMap = {
  Augusta: ["Kenny", "Shaan", "Tre", "Sam"],
  Perimeter: ["Aly", "Meviz", "Rahim", "Corey", "Insha", "Rehan", "Omarion"],
  Cumberland: ["Aly", "Meviz", "Rahim", "Corey", "Insha", "Rehan", "Omarion"],
  Southlake: ["Aly", "Meviz", "Rahim", "Corey", "Insha", "Rehan", "Omarion"],
  "Lynnhaven (Kiosk 1)": ["Ameen", "Mark", "Athishay", "Anwar", "Aries", "Harshita", "Roopa", "Kirtan"],
  "Lynnhaven (Kiosk 2)": ["Ameen", "Mark", "Athishay", "Anwar", "Aries", "Harshita", "Roopa", "Kirtan"],
  "Lynnhaven (Store)": ["Ameen", "Mark", "Athishay", "Anwar", "Aries", "Harshita", "Roopa", "Kirtan"],
  "Carolina Place": ["Channi"],
}

const RepairWaiver: React.FC = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    date: "",
    location: "",
    deviceModel: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    partBeingRepaired: "",
    technicianName: "",
    repairAmount: "",
    additionalNotes: "",
  })

  const [signature, setSignature] = useState<SignaturePadRef | null>(null)
  const signaturePadRef = useRef<SignaturePadRef | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTechnicians, setAvailableTechnicians] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (formData.location) {
      setAvailableTechnicians(techniciansMap[formData.location as keyof typeof techniciansMap])
      setFormData((prev) => ({ ...prev, technicianName: "" }))
    }
  }, [formData.location])

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

      // Save repair data
      console.log("Saving repair data...")
      await saveRepairData(fullFormData)
      console.log("Repair data saved successfully")

      // Generate PDF
      console.log("Generating PDF...")
      const termsAndConditions = document.getElementById("terms-and-conditions")?.innerText || ""
      await generatePDF("Repair", fullFormData, termsAndConditions)
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
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Device Repair Waiver</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          <div
            id="terms-and-conditions"
            className="bg-gray-50 p-4 mb-6 max-h-60 overflow-y-auto rounded-lg shadow-inner text-sm"
          >
            <h3 className="text-lg font-semibold mb-2">Terms and Conditions</h3>
            <p className="whitespace-pre-wrap">
              {`All specifications on the contract are subject to the following Terms and Conditions. By signing below, you acknowledge that you have read, understood, and agree to be bound by these terms regarding the repair of your device by Mobile Care.

1. Pricing & Additional Charges
1.1 Initial Repair Pricing
You, the customer, agree to the price indicated prior to the inspection and repair of your device. If Mobile Care discovers any underlying damage during the repair process, we will not be responsible for it. In such cases, a new price, along with revised terms and conditions, will be discussed. You may choose to proceed with the additional repair at your discretion.

1.2 Diagnostic & Service Fees
You will be subjected to a minimum $25 diagnostic fee under the following conditions:
- Cleaning service of any major parts.
- Diagnostic services performed on your device.
- If you choose to decline the repair after service has been completed, you will be charged a $45 fee.

2. Warranty Policy
2.1 Screen Warranty
All screen repairs come with a 30-day warranty. However, Mobile Care reserves the right to void the warranty under the following conditions:
- The device has water damage.
- The device has been dropped, showing visible cracks, blemishes, or scratches on the screen (LCD/Digitizer damage).
- The device has underlying damage, such as a bulging battery, that has caused the screen to crack.

2.2 Parts Warranty
All replacement parts (e.g., charging port, battery, camera) come with a 30-day warranty. However, Mobile Care reserves the right to void the warranty if:
- The device has water damage.
- The customer has damaged the part or has allowed unauthorized third-party repair services to repair the device.

2.3 Face ID & Proximity Sensor Disclaimer
If Mobile Care replaces your Proximity Sensor or Front-Facing Camera, we are not responsible if Face ID is disabled as replacing these components may permanently disable Face ID functionality.

2.4 Proof of Purchase Requirement
Customers must provide proof of purchase for all warranty repairs. Mobile Care reserves the right to deny service if proof of purchase is not provided.

3. Liability & Manufacturer Warranty
3.1 Manufacturer Warranty Void
Any repair done by Mobile Care will void the manufacturer's warranty. However, all repairs performed by us are backed by our own warranty policy. Mobile Care is only affiliated with Akko Insurance and does not provide coverage outside of this partnership.

3.2 Genuine & Premium Parts
Apple Devices:
Parts replaced on Apple devices are not genuine Apple parts. However, we use premium-quality Apple parts that will not affect the functionality of your device except for Face ID-related components.

Android Devices:
All Android screens used in repairs are genuine Android displays. Other small parts used are not genuine Android parts but are premium quality and will not affect functionality.

3.3 Device Functionality & Limitations
Mobile Care is not responsible for:
- Devices becoming disabled or unavailable after repair.
- Software or network-related issues affecting the customer's device after repair.
- Loss of water resistance after damage and/or repair. All devices will lose their original water resistance rating post-repair.
- Any Face ID-related functionality loss due to necessary component replacements.

4. Disposal & Legal Compliance
4.1 Abandoned Devices
If you leave your device with Mobile Care for more than 45 days, we will consider it abandoned and reserve the right to dispose of it.

4.2 Compliance with Local Laws
Mobile Care abides by all local laws and city ordinances in the state and city of operation. We do not tolerate:
- Dishonesty in customer transactions.
- Stolen devices or attempts to repair stolen devices.
- Forgery of any documents or customer information.

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
              <label className="block mb-1">Part Being Repaired</label>
              <input
                type="text"
                name="partBeingRepaired"
                value={formData.partBeingRepaired}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block mb-1">Technician Name</label>
              <select
                name="technicianName"
                value={formData.technicianName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded focus:border-[rgb(126,232,194)] focus:ring focus:ring-[rgb(126,232,194)] focus:ring-opacity-50"
              >
                <option value="">Select a technician</option>
                {availableTechnicians.map((technician) => (
                  <option key={technician} value={technician}>
                    {technician}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Repair Amount</label>
              <input
                type="number"
                name="repairAmount"
                value={formData.repairAmount}
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
                "Submit Repair Waiver"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RepairWaiver

