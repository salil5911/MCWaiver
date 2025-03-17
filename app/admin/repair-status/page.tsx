"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Edit2, Save } from "lucide-react";
import { useSheetData } from "@/hooks/useSheetData";

type RepairStatusEntry = {
  id: number;
  date: string;
  deviceModel: string;
  customerName: string;
  phoneNumber: string;
  partBeingRepaired: string;
  technicianName: string;
  repairAmount: string;
  warrantyExpiration: string;
  additionalNotes: string;
  postInspectionNotes: string;
};

export default function RepairStatus() {
  const [repairData, setRepairData] = useState<RepairStatusEntry[]>([]);
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
          deviceModel: row[1],
          customerName: row[2],
          phoneNumber: row[3],
          partBeingRepaired: row[4],
          technicianName: row[5],
          repairAmount: row[6],
          warrantyExpiration:
            new Date(row[0]) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ? "Covered"
              : "Expired",
          additionalNotes: row[7],
          postInspectionNotes: row[8],
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setRepairData(sortedData);
    }
  }, [data]);

  // Filter data based on search term
  const filteredData = repairData.filter((entry) =>
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
    const updatedData = repairData.map((item) =>
      item.id === id ? { ...item, postInspectionNotes: editedNote } : item
    );
    setRepairData(updatedData);
    setEditingId(null);

    try {
      await fetch("/api/updateSheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          postInspectionNotes: editedNote,
        }),
      });
    } catch (error) {
      console.error("Failed to update notes:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-FXwex27GUXlbU1gWquCxj4JDcgu5Jh.png"
                alt="Mobile Care Logo"
                width={120}
                height={32}
              />
              <h1 className="ml-4 text-2xl font-bold text-gray-900">Repair Status</h1>
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

      {/* Search Bar */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4 flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-[rgb(126,232,194)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Date",
                    "Device Model",
                    "Customer",
                    "Phone",
                    "Part Repaired",
                    "Technician",
                    "Repair Amount",
                    "Warranty",
                    "Additional Notes",
                    "Post Inspection Notes",
                  ].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4">{entry.date}</td>
                    <td className="px-6 py-4">{entry.deviceModel}</td>
                    <td className="px-6 py-4">{entry.customerName}</td>
                    <td className="px-6 py-4">{entry.phoneNumber}</td>
                    <td className="px-6 py-4">{entry.partBeingRepaired}</td>
                    <td className="px-6 py-4">{entry.technicianName}</td>
                    <td className="px-6 py-4">{entry.repairAmount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entry.warrantyExpiration === "Covered"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.warrantyExpiration}
                      </span>
                    </td>
                    <td className="px-6 py-4">{entry.additionalNotes}</td>
                    <td className="px-6 py-4">
                      {editingId === entry.id ? (
                        <>
                          <textarea
                            value={editedNote}
                            onChange={(e) => setEditedNote(e.target.value)}
                          />
                          <button onClick={() => handleSaveNote(entry.id)}>
                            <Save />
                          </button>
                        </>
                      ) : (
                        <>
                          {entry.postInspectionNotes}
                          <button onClick={() => handleEditNote(entry.id, entry.postInspectionNotes)}>
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
        </div>
      </main>
    </div>
  );
}
