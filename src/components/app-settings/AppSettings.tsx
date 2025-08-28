import { getOutlookIntegrationList } from "../../services/User";
import React, { useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

interface EmailRow {
    id: number;
    email: string;
    includeAllEmails: boolean;
    includeAllAttachments: boolean;
}

interface AppSettingsProps {
    // Define any props if needed
    setShowOutlookConfig: (show: boolean) => void;
}

const AppSettings: React.FC<AppSettingsProps> = ({ setShowOutlookConfig }) => {
    const [data, setData] = useState<EmailRow[]>(
        Array.from({ length: 13 }).map((_, i) => ({
            id: i + 1,
            email: `steven.birdwell@boardwalktech.com`,
            includeAllEmails: i % 2 === 0,
            includeAllAttachments: i % 3 === 0,
        }))
    );

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const totalPages = Math.ceil(data.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = data.slice(startIndex, startIndex + rowsPerPage);

    const handleCheckboxChange = (
        id: number,
        field: "includeAllEmails" | "includeAllAttachments"
    ) => {
        setData((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, [field]: !row[field] } : row
            )
        );
    };

    const handleDelete = (id: number) => {
        setData((prev) => prev.filter((row) => row.id !== id));
    };

    const getFilterList = async () => {
        // Simulate an API call to fetch filter list
        try {
            const response = await getOutlookIntegrationList();
            console.log("Filter list response:", response);
        } catch (error) {
            console.error("Error fetching filter list:", error);
        }
    };

    useEffect(() => {
        getFilterList();
    }, []);

    return (
        <div className="h-[100%] text-white p-6 pt-22">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button
                        className="text-gray-400 hover:text-gray-200 cursor-pointer"
                        onClick={() => setShowOutlookConfig(false)}
                    >
                        ←
                    </button>
                    <h1 className="text-lg font-semibold">Outlook Settings</h1>
                </div>
                <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold cursor-pointer"
                    onClick={() => setShowOutlookConfig(false)}
                >
                    Save
                </button>
            </div>

            {/* Add Email Button */}
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold mb-3 cursor-pointer">
                Add Email
            </button>

            {/* Table */}
            <div className="bg-[#1e2235] rounded-md overflow-hidden">
                <div className="overflow-y-auto max-h-64">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="sticky top-0 bg-[#1e2235] text-gray-400">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3 text-center">
                                    Include All Emails
                                </th>
                                <th className="px-4 py-3 text-center">
                                    Include All Attachments
                                </th>
                                <th className="px-4 py-3 text-center">
                                    Delete
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-[#2b2f43] hover:bg-[#2b2f43]"
                                >
                                    <td className="px-4 py-2 flex items-center gap-2">
                                        <FaEnvelope className="text-gray-400" />
                                        {row.email}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={row.includeAllEmails}
                                            onChange={() =>
                                                handleCheckboxChange(
                                                    row.id,
                                                    "includeAllEmails"
                                                )
                                            }
                                            className="h-4 w-4 text-blue-600 bg-[#2b2f43] border-gray-600 rounded focus:ring-blue-500"
                                            title="Include All Emails"
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={row.includeAllAttachments}
                                            onChange={() =>
                                                handleCheckboxChange(
                                                    row.id,
                                                    "includeAllAttachments"
                                                )
                                            }
                                            className="h-4 w-4 text-blue-600 bg-[#2b2f43] border-gray-600 rounded focus:ring-blue-500"
                                            title="Include All Attachments"
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="text-gray-400 hover:text-red-500"
                                            title="Delete Email"
                                        >
                                            <IoMdClose className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#1e2235] text-gray-400 text-sm">
                    <div>
                        Rows per page:{" "}
                        <select
                            className="bg-[#2b2f43] text-gray-300 px-2 py-1 rounded"
                            value={rowsPerPage}
                            disabled
                            title="Rows per page"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>
                            {startIndex + 1}-
                            {Math.min(startIndex + rowsPerPage, data.length)} of{" "}
                            {data.length}
                        </span>
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className={`px-2 py-1 rounded ${
                                currentPage === 1
                                    ? "text-gray-600 cursor-not-allowed"
                                    : "hover:bg-[#2b2f43] cursor-pointer"
                            }`}
                        >
                            ←
                        </button>
                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(p + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className={`px-2 py-1 rounded ${
                                currentPage === totalPages
                                    ? "text-gray-600 cursor-not-allowed"
                                    : "hover:bg-[#2b2f43] cursor-pointer"
                            }`}
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppSettings;
