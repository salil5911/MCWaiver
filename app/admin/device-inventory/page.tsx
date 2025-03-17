"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Edit2, Save } from "lucide-react";
import { useSheetData } from "@/hooks/useSheetData";

type DeviceInventoryEntry = {
  id: number;
  date: string;
  deviceModel: string;
  status: string;
  location: string;
  price: string;
  notes: string;
};

export default function DeviceInventoryPage() {
  const [deviceInventoryData, setDeviceInventoryData] = useState<DeviceInventoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedNote, setEditedNote] = useState("");
  const router = useRouter();

  // Fetch data using Google Sheets
  const { data, error, isLoading } = useSheetData();

  // Load and sort data once fetched
  useEffect(() => {
    if (data) {
      const sortedData = data
        .map((row, index) => ({
          id: index,
          date: row[0],
          deviceModel: row[1],
          status: row[2],
          location: row[3],
          price: row[4],
          notes: row[5],
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setDeviceInventoryData(sortedData);
    }
  }, [data]);

  // Filter data based on search term
  const filteredData = deviceInventoryData.filter((entry) =>
    Object.values(entry).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle editing notes
  const handleEditNote = (id: number, note: string) => {
    setEditingId(id);
    setEditedNote(note);
  };

  // Handle saving notes (update Google Sheets here)
  const handleSaveNote = async (id: number) => {
    const updatedData = deviceInventoryData.map((item) =>
      item.id === id ? { ...item, notes: editedNote } : item
    );
    setDeviceInventoryData(updatedData);
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
      <h1 className="text-2xl font-bold">Device Inventory</h1>
      <input
        type="text"
        placeholder="Search by model, status, location, or notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded px-4 py-2 mb-4 w-full"
      />
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr>
            {["Date", "Device Model", "Status", "Location", "Price", "Notes"].map((header) => (
              <th key={header} className="px-4 py-2 border-b">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry) => (
            <tr key={entry.id}>
              <td className="border px-4 py-2">{entry.date}</td>
              <td className="border px-4 py-2">{entry.deviceModel}</td>
              <td className="border px-4 py-2">{entry.status}</td>
              <td className="border px-4 py-2">{entry.location}</td>
              <td className="border px-4 py-2">{entry.price}</td>
              <td className="border px-4 py-2">
                {editingId === entry.id ? (
                  <>
                    <input
                      type="text"
                      value={editedNote}
                      onChange={(e) => setEditedNote(e.target.value)}
                    />
                    <button onClick={() => handleSaveNote(entry.id)}>
                      <Save />
                    </button>
                  </>
                ) : (
                  <>
                    {entry.notes}
                    <button onClick={() => handleEditNote(entry.id, entry.notes)}>
                      <Edit2 />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
