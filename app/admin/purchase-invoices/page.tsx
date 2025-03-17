"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Edit2, Save } from "lucide-react";
import { useSheetData } from "@/hooks/useSheetData";

type PurchaseInvoiceEntry = {
  id: number;
  invoiceNumber: string;
  date: string;
  customerName: string;
  amount: string;
  paymentMethod: string;
  notes: string;
};

export default function PurchaseInvoicesPage() {
  const [purchaseInvoicesData, setPurchaseInvoicesData] = useState<PurchaseInvoiceEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedNote, setEditedNote] = useState("");
  const router = useRouter();

  const { data, error, isLoading } = useSheetData();

  useEffect(() => {
    if (data) {
      const sortedData = data
        .map((row, index) => ({
          id: index,
          invoiceNumber: row[0],
          date: row[1],
          customerName: row[2],
          amount: row[3],
          paymentMethod: row[4],
          notes: row[5],
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setPurchaseInvoicesData(sortedData);
    }
  }, [data]);

  const filteredData = purchaseInvoicesData.filter((entry) =>
    Object.values(entry).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleEditNote = (id: number, note: string) => {
    setEditingId(id);
    setEditedNote(note);
  };

  const handleSaveNote = async (id: number) => {
    const updatedData = purchaseInvoicesData.map((item) =>
      item.id === id ? { ...item, notes: editedNote } : item
    );
    setPurchaseInvoicesData(updatedData);
    setEditingId(null);

    try {
      await fetch("/api/updateSheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          notes: editedNote,
        }),
      });
    } catch (error) {
      console.error("Failed to update notes:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Purchase Invoices</h1>
      <input
        type="text"
        placeholder="Search by invoice number, customer, or notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded px-4 py-2 mb-4 w-full"
      />
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr>
            {["Invoice #", "Date", "Customer", "Amount", "Payment Method", "Notes"].map((header) => (
              <th key={header} className="px-4 py-2 border-b">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry) => (
            <tr key={entry.id}>
              <td className="border px-4 py-2">{entry.invoiceNumber}</td>
              <td className="border px-4 py-2">{entry.date}</td>
              <td className="border px-4 py-2">{entry.customerName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
