import React, { useState, useEffect, useRef } from "react";
import CustomButton from "../CustomButton";
import moment from "moment";
import { useTheme } from "../useTheme";

const DateRangeDropdown: React.FC<{
    handleDateSelection?: (
        dateRange: string,
        startDate: string,
        endDate: string
    ) => void;
}> = ({ handleDateSelection = () => {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");

    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    const handleOutsideClick = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () =>
            document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const handleDateSelect = (value: string) => {
        let startDate = "";
        let endDate = "";
        if (value === "Last 24 hours") {
            startDate = moment()
                .subtract(24, "hours")
                .format("YYYY-MM-DD:HH:mm:ss");
            endDate = moment().format("YYYY-MM-DD:HH:mm:ss");
            setStartDate(startDate);
            setEndDate(endDate);
        } else if (value === "Last 7 days") {
            startDate = moment()
                .subtract(7, "days")
                .format("YYYY-MM-DD:HH:mm:ss");
            endDate = moment().format("YYYY-MM-DD:HH:mm:ss");
            setStartDate(startDate);
            setEndDate(endDate);
        } else if (value === "Last 30 days") {
            startDate = moment()
                .subtract(30, "days")
                .format("YYYY-MM-DD:HH:mm:ss");
            endDate = moment().format("YYYY-MM-DD:HH:mm:ss");
            setStartDate(startDate);
            setEndDate(endDate);
        } else if (value === "Last 90 days") {
            startDate = moment()
                .subtract(90, "days")
                .format("YYYY-MM-DD:HH:mm:ss");
            endDate = moment().format("YYYY-MM-DD:HH:mm:ss");
            setStartDate(startDate);
            setEndDate(endDate);
        }
        handleDateSelection(value, startDate, endDate);
        setSelectedDate(value);
        setIsOpen(false);
    };

    const handleApply = () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }
        if (moment(startDate).isAfter(moment(endDate))) {
            alert("Start date cannot be after end date.");
            return;
        }
        const stDate = moment(startDate).format("YYYY-MM-DD:HH:mm:ss");
        const enDate = moment(endDate).format("YYYY-MM-DD:HH:mm:ss");
        handleDateSelection(selectedDate, stDate, enDate);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <CustomButton
                onClick={() => setIsOpen(!isOpen)}
                label={selectedDate || "Date Range"}
                theme={theme}
            />
            {isOpen && (
                <div
                    className={`absolute ${
                        theme === "dark"
                            ? "bg-gray-800 text-white"
                            : "bg-white text-black"
                    }  mt-2 rounded shadow-lg p-2 w-48 z-50 min-w-[250px]`}
                >
                    <ul>
                        <li
                            className={`"cursor-pointer ${
                                theme === "dark"
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-200"
                            } p-2`}
                            onClick={() => handleDateSelect("Last 24 hours")}
                        >
                            Last 24 hr
                        </li>
                        <li
                            className={`"cursor-pointer ${
                                theme === "dark"
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-200"
                            } p-2`}
                            onClick={() => handleDateSelect("Last 7 days")}
                        >
                            Last 7 days
                        </li>
                        <li
                            className={`"cursor-pointer ${
                                theme === "dark"
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-200"
                            } p-2`}
                            onClick={() => handleDateSelect("Last 30 days")}
                        >
                            Last 30 days
                        </li>
                        <li
                            className={`"cursor-pointer ${
                                theme === "dark"
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-200"
                            } p-2`}
                            onClick={() => handleDateSelect("Last 90 days")}
                        >
                            Last 90 days
                        </li>
                        <li className="p-2">
                            <div className="flex align-middle content-center justify-between items-center gap-2 mb-2">
                                <label className="text-sm">Start Date</label>
                                <input
                                    type="date"
                                    className={`${
                                        theme === "dark"
                                            ? "bg-gray-700 text-white"
                                            : "bg-gray-200 text-black"
                                    } rounded p-1 w-[62%]`}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setSelectedDate("Custom");
                                    }}
                                    value={startDate}
                                    placeholder="Start Date"
                                />
                            </div>
                            <div className="flex align-middle content-center justify-between items-center gap-2">
                                <label className="text-sm">End Date</label>
                                <input
                                    type="date"
                                    className={`${
                                        theme === "dark"
                                            ? "bg-gray-700 text-white"
                                            : "bg-gray-200 text-black"
                                    } rounded p-1 w-[62%]`}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setSelectedDate("Custom");
                                    }}
                                    value={endDate}
                                    placeholder="End Date"
                                />
                            </div>
                            <button
                                className="bg-blue-600 w-full text-white rounded p-2 mt-2 hover:bg-blue-700"
                                onClick={() => handleApply()}
                            >
                                Apply
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DateRangeDropdown;
