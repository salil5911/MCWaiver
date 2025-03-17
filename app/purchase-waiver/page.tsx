"use client"

import dynamic from "next/dynamic"

const PurchaseWaiver = dynamic(() => import("@/components/PurchaseWaiver"), { ssr: false })

export default function PurchaseWaiverPage() {
  return <PurchaseWaiver />
}

