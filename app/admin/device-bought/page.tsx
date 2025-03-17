"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Edit2, Save } from "lucide-react";
import { useSheetData } from "@/hooks/useSheetData";

type DeviceBoughtEntry = {
  id: number;
  date: string;
  deviceModel: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  imei: string;
  price: string;
  validIdNumber: string;
  notes: string;
};

export default function DeviceBought() {
  const [deviceBoughtData, setDeviceBoughtData] = useState<DeviceBoughtEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedNote, setEditedNote] = useState("");
  const router = useRouter();

  // Fetch data using the Google Sheets hook
  const { data, error, isLoading } = useSheetData();

  // Load and sort data once fetched
  useEffect(() => {
    if (data) {
      const sortedData = data
        .map((row, index) => ({
          id: index,
          date: row[0],
          deviceModel: row[1],
          firstName: row[2],
          lastName: row[3],
          phoneNumber: row[4],
          imei: row[5],
          price: row[6],
          validIdNumber: row[7],
          notes: row[8],
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setDeviceBoughtData(sortedData);
    }
  }, [data]);

  // Filter data based on search term
  const filteredData = deviceBoughtData.filter((entry) =>
    Object.values(entry).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle editing notes
  const handleEditNote = (id: number, note: string) => {
    setEditingId(id);
    setEditedNote(note);
  };

  // Handle saving notes (you’ll need to write an API to update Google Sheets)
  const handleSaveNote = async (id: number) => {
    const updatedData = deviceBoughtData.map((item) =>
      item.id === id ? { ...item, notes: editedNote } : item
    );
    setDeviceBoughtData(updatedData);
    setEditingId(null);

    // Update Google Sheets here (this will require a separate API)
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
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Device Bought</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="text-sm font-medium text-[rgb(126,232,194)] hover:text-[rgb(126,232,194)/0.8]"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search Bar */}
          <div className="mb-4 flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by name, device, date, IMEI, or notes..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-[rgb(126,232,194)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Date",
                    "Device Model",
                    "Name",
                    "Phone",
                    "IMEI",
                    "Price",
                    "Valid ID",
                    "Notes",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.deviceModel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${entry.firstName} ${entry.lastName}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.imei}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.validIdNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {editingId === entry.id ? (
                        <div className="flex items-center">
                          <textarea
                            value={editedNote}
                            onChange={(e) => setEditedNote(e.target.value)}
                            className="w-full p-2 border rounded"
                            rows={3}
                          />
                          <button
                            onClick={() => handleSaveNote(entry.id)}
                            className="ml-2 p-1 text-[rgb(126,232,194)] hover:text-[rgb(126,232,194)/0.8]"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <span>{entry.notes}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
