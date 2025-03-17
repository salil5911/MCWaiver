"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Edit2, Save } from "lucide-react";
import { useSheetData } from "@/hooks/useSheetData";

type DeviceSoldEntry = {
  id: number;
  date: string;
  deviceModel: string;
  customerName: string;
  phoneNumber: string;
  imei: string;
  price: string;
  notes: string;
};

export default function DeviceSoldPage() {
  const [deviceSoldData, setDeviceSoldData] = useState<DeviceSoldEntry[]>([]);
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
          date: row[0],
          deviceModel: row[1],
          customerName: row[2],
          phoneNumber: row[3],
          imei: row[4],
          price: row[5],
          notes: row[6],
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setDeviceSoldData(sortedData);
    }
  }, [data]);

  const filteredData = deviceSoldData.filter((entry) =>
    Object.values(entry).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleEditNote = (id: number, note: string) => {
    setEditingId(id);
    setEditedNote(note);
  };

  const handleSaveNote = async (id: number) => {
    const updatedData = deviceSoldData.map((item) =>
      item.id === id ? { ...item, notes: editedNote } : item
    );
    setDeviceSoldData(updatedData);
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
      <h1 className="text-2xl font-bold">Device Sold</h1>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded px-4 py-2 mb-4 w-full"
      />
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr>
            {["Date", "Device Model", "Customer", "Phone", "IMEI", "Price", "Notes"].map((header) => (
              <th key={header} className="px-4 py-2 border-b">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry) => (
            <tr key={entry.id}>
              <td className="border px-4 py-2">{entry.date}</td>
              <td className="border px-4 py-2">{entry.deviceModel}</td>
              <td className="border px-4 py-2">{entry.customerName}</td>
              <td className="border px-4 py-2">{entry.phoneNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
