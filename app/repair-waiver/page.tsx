"use client"

import dynamic from "next/dynamic"

const RepairWaiver = dynamic(() => import("@/components/RepairWaiver"), { ssr: false })

export default function RepairWaiverPage() {
  return <RepairWaiver />
}

