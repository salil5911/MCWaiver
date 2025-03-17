export type DeviceInventory = {
  id: string
  dateOfPurchase: string
  deviceModel: string
  imei: string
  vendor: string
  costPrice: number
  dateOfSale: string | null
  sellingPrice: number | null
  notes: string
}

