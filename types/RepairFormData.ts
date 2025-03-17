// types/RepairFormData.ts
export type RepairFormData = {
  id: number
  date: string
  location: string
  deviceModel: string
  firstName: string
  lastName: string
  phoneNumber: string
  partBeingRepaired: string
  technicianName: string
  repairAmount: string
  additionalNotes: string
  signature?: string
  timestamp: string // New field for submission timestamp
  postInspectionNotes: string // New field for post inspection notes
}

