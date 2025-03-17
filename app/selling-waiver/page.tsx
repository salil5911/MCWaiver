"use client"

import dynamic from "next/dynamic"

const SellingWaiver = dynamic(() => import("@/components/SellingWaiver"), { ssr: false })

export default function SellingWaiverPage() {
  return <SellingWaiver />
}

