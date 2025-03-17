import { jsPDF } from "jspdf"
import { Font } from "@react-pdf/renderer"

// Register fonts
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
})

type WaiverType = "Repair" | "Purchase" | "Selling"

interface FormData {
  date: string
  firstName: string
  lastName: string
  deviceModel: string
  phoneNumber: string
  signature?: string
  [key: string]: any
}

export async function generatePDF(
  waiverType: WaiverType,
  formData: FormData,
  termsAndConditions: string,
): Promise<void> {
  try {
    console.log(`Generating ${waiverType} PDF...`)

    // Initialize jsPDF
    const doc = new jsPDF()
    if (!doc) {
      throw new Error("Failed to initialize PDF document")
    }

    // Set font
    doc.setFont("helvetica", "normal")

    // Add logo
    const logoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-FXwex27GUXlbU1gWquCxj4JDcgu5Jh.png"
    const logoWidth = 40
    const logoHeight = 10.67 // Maintain aspect ratio (150x40)

    // Create a new image and wait for it to load
    const img = new Image()
    img.crossOrigin = "anonymous" // Prevent CORS issues

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = logoUrl
    })

    doc.addImage(img, "PNG", (doc.internal.pageSize.width - logoWidth) / 2, 10, logoWidth, logoHeight)

    // Add title
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text(`${waiverType} Waiver`, 105, 25, { align: "center" })

    // Add terms and conditions
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const splitTerms = doc.splitTextToSize(termsAndConditions, 180)
    let termsYStart = 40
    splitTerms.forEach((line: string) => {
      if (termsYStart > 280) {
        doc.addPage()
        termsYStart = 20
      }
      doc.text(line, 15, termsYStart)
      termsYStart += 5
    })

    // Add a new page for form data
    doc.addPage()

    // Add form data
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Form Details", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    let formDataYStart = 40

    Object.entries(formData).forEach(([key, value], index) => {
      if (key !== "signature") {
        const formattedKey =
          key.charAt(0).toUpperCase() +
          key
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim()
        doc.setFont("helvetica", "bold")
        doc.text(`${formattedKey}:`, 20, formDataYStart)
        doc.setFont("helvetica", "normal")
        doc.text(`${value?.toString() || ""}`, 80, formDataYStart)
        formDataYStart += 10

        if (formDataYStart > 280) {
          doc.addPage()
          formDataYStart = 20
        }
      }
    })

    // Add signature if available
    if (formData.signature) {
      if (formDataYStart > 240) {
        doc.addPage()
        formDataYStart = 20
      }
      doc.setFont("helvetica", "bold")
      doc.text("Signature:", 20, formDataYStart)
      formDataYStart += 10

      try {
        const img = new Image()
        img.src = formData.signature
        doc.addImage(img, "PNG", 20, formDataYStart, 70, 35)
      } catch (imgError) {
        console.error("Failed to add signature image:", imgError)
        doc.text("(Signature not displayed)", 20, formDataYStart)
      }
    }

    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text("Mobile Care - Professional Device Services", 105, 290, { align: "center" })
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" })
    }

    // Generate filename
    const filename = `${formData.firstName}_${formData.lastName}_${waiverType}Waiver_${formData.date}.pdf`

    // Save the PDF
    doc.save(filename)
    console.log("PDF generated successfully")
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

