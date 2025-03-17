"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Edit2, Save } from "lucide-react";
import { useSheetData } from "@/hooks/useSheetData";

type PhoneBoughtEntry = {
  id: number;
  date: string;
  phoneModel: string;
  customerName: string;
  phoneNumber: string;
  imei: string;
  price: string;
  validIdNumber: string;
  notes: string;
};

export default function PhoneBoughtPage() {
  const [phoneBoughtData, setPhoneBoughtData] = useState<PhoneBoughtEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedNote, setEditedNote] = useState("");
  const router = useRouter();

  // Fetch data using Google Sheets
  const { data, error, isLoading } = useSheetData();

  useEffect(() => {
    if (data) {
      const sortedData = data
        .map((row, index) => ({
          id: index,
          date: row[0],
          phoneModel: row[1],
          customerName: row[2],
          phoneNumber: row[3],
          imei: row[4],
          price: row[5],
          validIdNumber: row[6],
          notes: row[7],
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setPhoneBoughtData(sortedData);
    }
  }, [data]);

  // Filter data based on search term
  const filteredData = phoneBoughtData.filter((entry) =>
    Object.values(entry).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle editing notes
  const handleEditNote = (id: number, note: string) => {
    setEditingId(id);
    setEditedNote(note);
  };

  // Handle saving notes (update Google Sheets)
  const handleSaveNote = async (id: number) => {
    const updatedData = phoneBoughtData.map((item) =>
      item.id === id ? { ...item, notes: editedNote } : item
    );
    setPhoneBoughtData(updatedData);
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
      <h1 className="text-2xl font-bold mb-4">Phone Bought</h1>
      <input
        type="text"
        placeholder="Search by phone model, customer, IMEI, or notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded px-4 py-2 mb-4 w-full"
      />
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr>
            {[
              "Date",
              "Phone Model",
              "Customer Name",
              "Phone Number",
              "IMEI",
              "Price",
              "Valid ID",
              "Notes",
            ].map((header) => (
              <th key={header} className="px-4 py-2 border-b">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry) => (
            <tr key={entry.id}>
              <td className="border px-4 py-2">{entry.date}</td>
              <td className="border px-4 py-2">{entry.phoneModel}</td>
              <td className="border px-4 py-2">{entry.customerName}</td>
              <td className="border px-4 py-2">{entry.phoneNumber}</td>
              <td className="border px-4 py-2">{entry.imei}</td>
              <td className="border px-4 py-2">{entry.price}</td>
              <td className="border px-4 py-2">{entry.validIdNumber}</td>
              <td className="border px-4 py-2">
                {editingId === entry.id ? (
                  <>
                    <input
                      type="text"
                      value={editedNote}
                      onChange={(e) => setEditedNote(e.target.value)}
                      className="border rounded px-2 py-1"
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
