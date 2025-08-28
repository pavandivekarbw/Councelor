"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { Card } from "../../components/ui/Card";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from "../../components/Table";
import { ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import Loader from "../../components/loader/Loader";
import { getLocalDateFromUTC, getUTCDateFromLocal } from "../../util/helper";
import DateRangeDropdown from "../../components/dropdown/DateRangeDropdown";
import FileTypeDropdown from "../../components/dropdown/FileTypeDropdown";
import CustomFileViewer from "../../components/file-viewer/CustomFileViewer";
import { fetchWorkspaceSearchResult } from "../../services/HomeAPI";
import CustomNotification from "../../components/custom-notification/CustomNotification";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import {
    clearNotifications,
    showNotification,
} from "../../lib/feature/toaster";
import LLM from "../../components/LLM";
import { getDocument, getFeeds, uploadFiles } from "../../services/FeedAPI";
import { setRefreshAPI } from "../../lib/feature/refreshAPI";
import { getMimeTypes } from "./helper";
import { useTheme } from "../../components/useTheme";
import CustomButton from "../../components/CustomButton";
import { saveAs } from "file-saver";

interface DataItem {
    documentId: string;
    name: string;
    source: string;
    selected: boolean;
    date: string;
}

interface DocumentDetails {
    documentId: number;
    documentName: string;
    documentLocation: string;
    documentStream: string;
}

const FeedComponent: React.FC = () => {
    const { show, message, type, duration } = useAppSelector(
        (state) => state.toaster
    );
    const { state, loading, searchPlaceholder } = useAppSelector(
        (state) => state.homePage
    );
    const { shouldRefresh } = useAppSelector((state) => state.refreshAPI);
    const dispatch = useAppDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<keyof DataItem | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [data, setData] = useState<DataItem[]>([]);
    // const [originalData, setOriginalData] = useState<DataItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedFileType, setSelectedFileType] = useState<string>("");
    const [documentDetails, setDocumentDetails] = useState<DocumentDetails>({
        documentId: 0,
        documentName: "",
        documentLocation: "",
        documentStream: "",
    });
    const [mimeType, setMimeType] = useState<string | undefined>("");
    const [showDocumentModal, setShowDocumentModal] = useState<boolean>(false);
    const tableFileUplode = useRef<HTMLInputElement | null>(null);
    const [jsonData, setJsonData] = useState<string>("");

    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [dateRange, setDateRange] = useState<string>("");
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const options = [10, 20, 50, 100];
    const [showAnalyse, setShowAnalyse] = useState<boolean>(false);
    const [selectedRows, setSelctedRows] = useState<DataItem[]>([]);
    const [reload, setReload] = useState<boolean>(false);
    const { theme, setReloadRecentSearch } = useTheme();

    // const totalPages = Math.ceil(data.length / rowsPerPage);

    const onChangeFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            try {
                setIsLoading(true);
                const fileArray = Array.from(files);
                const formData = new FormData();
                fileArray.forEach((file) => {
                    formData.append("files", file, file.name);
                });
                const responses = await uploadFiles(formData);
                setIsLoading(false);
                fetchFeedData();
                console.log("Files uploaded successfully:", responses);
            } catch (error) {
                console.error("Error reading files:", error);
                setIsLoading(false);
                dispatch(
                    showNotification({
                        show: true,
                        message: "Error reading files",
                        type: "error",
                        duration: 3000,
                    })
                );
            }
        }
    };

    const handleSort = (field: keyof DataItem) => {
        const newOrder =
            sortField === field && sortOrder === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortOrder(newOrder);
        setData((prevData) =>
            [...prevData].sort((a, b) => {
                if (a[field] < b[field]) return newOrder === "asc" ? -1 : 1;
                if (a[field] > b[field]) return newOrder === "asc" ? 1 : -1;
                return 0;
            })
        );
    };

    const toggleSelect = (event: React.MouseEvent, index: number) => {
        if (event.shiftKey) {
            const indices: number[] = [];
            let i = 0;
            while (i <= index) {
                indices.push(i);
                i++;
            }
            setData((prevData) =>
                prevData.map((item, i) => ({
                    ...item,
                    selected: indices.includes(i)
                        ? !prevData[index].selected
                        : item.selected,
                }))
            );
        } else
            setData((prevData) =>
                prevData.map((item, i) =>
                    i === index ? { ...item, selected: !item.selected } : item
                )
            );
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setData((prevData) =>
            prevData.map((item) => ({ ...item, selected: isChecked }))
        );
    };

    const handleNextPage = () =>
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const handlePrevPage = () =>
        setCurrentPage((prev) => Math.max(prev - 1, 1));

    const fetchFeedData = async () => {
        try {
            setIsLoading(true);
            setData([]);

            const result = await getFeeds(currentPage, rowsPerPage);
            if (result?.error) {
                setIsLoading(false);
                console.log("No data received from API");
                return;
            }
            const formattedData: DataItem[] = [];
            result.data.forEach(
                (item: {
                    documentId: number;
                    documentName: string;
                    documentSource: string;
                    documentCreatedOn: string;
                    source: string;
                }) => {
                    formattedData.push({
                        documentId: item.documentId.toString(),
                        name: item.documentName,
                        source: item.documentSource,
                        date: item.documentCreatedOn,
                        selected: false,
                    });
                }
            );
            const totalPages = result?.totalPages || 1;
            setTotalPages(totalPages);
            setData(
                formattedData.sort(
                    (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                )
            );
            setIsLoading(false);
            dispatch(setRefreshAPI(false));
        } catch (error) {
            setIsLoading(false);
            setData([]);
            console.error("Error fetching feed data:", error);
            dispatch(
                showNotification({
                    show: true,
                    message: "Error fetching feed data",
                    type: "error",
                    duration: 3000,
                })
            );
        }
    };

    const handleSearch = async (emptySearch?: boolean) => {
        if (searchTerm.trim() || emptySearch) {
            try {
                setIsLoading(true);
                const result = await fetchWorkspaceSearchResult(
                    {
                        searchString: searchTerm,
                        startDate: getUTCDateFromLocal(startDate),
                        endDate: getUTCDateFromLocal(endDate),
                        documentType:
                            !selectedFileType || selectedFileType === "All"
                                ? ""
                                : selectedFileType.toLocaleUpperCase(),
                    },
                    true
                );
                const data = result.data.map(
                    (item: {
                        objectName: string;
                        createdOn: string;
                        objectId: number;
                        documentAddedOn: string;
                        documentCreatedOn: string;
                        documentId: number;
                        documentName: string;
                        documentOwner: number;
                        documentSource: string;
                        documentType: string;
                        feedRegistryId: number;
                    }) => ({
                        name: item.documentName,
                        date: item.documentCreatedOn,
                        documentId: item.documentId,
                        source: item.documentSource,
                        selected: false,
                    })
                );
                setIsLoading(false);
                setData(
                    data.sort(
                        (a: DataItem, b: DataItem) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                    )
                );
                console.log("setting recent search to true");
                setReloadRecentSearch(true);
            } catch (error) {
                setIsLoading(false);
                console.error("Error during search:", error);
                dispatch(
                    showNotification({
                        show: true,
                        message: "Error during search",
                        type: "error",
                        duration: 3000,
                    })
                );
            }
        }
    };

    const handleDownloadFile = async () => {
        if (selectedRows.length === 0) {
            dispatch(
                showNotification({
                    show: true,
                    message: "Please select a file to download",
                    type: "warning",
                    duration: 3000,
                })
            );
            return;
        }
        setIsLoading(true);
        try {
            selectedRows.forEach(async (element) => {
                const file = element.documentId;
                const fileId = parseInt(file);
                const result = await getDocument(fileId);
                if (!result) {
                    dispatch(
                        showNotification({
                            show: true,
                            message: "File not found",
                            type: "error",
                            duration: 3000,
                        })
                    );
                    return;
                }
                const url = location.origin;
                saveAs(
                    url +
                        "/" +
                        result.documentLocation +
                        "/" +
                        encodeURIComponent(result.documentName),
                    result.documentName
                );
            });
            setIsLoading(false);
        } catch (error) {
            console.error("Error downloading file:", error);
            dispatch(
                showNotification({
                    show: true,
                    message: "Error downloading file",
                    type: "error",
                    duration: 3000,
                })
            );
        } finally {
            setIsLoading(false);
        }
    };
    const handleFileClick = async (item: DataItem) => {
        setIsLoading(true);
        setJsonData("");
        const result = await getDocument(parseInt(item.documentId));
        setIsLoading(false);
        const fileType = result?.documentName.split(".").pop() ?? "";
        setMimeType(getMimeTypes(fileType));
        setDocumentDetails(result);
        setShowDocumentModal(true);
    };
    const handleDateSelection = (
        dateRange: string,
        startDate: string,
        endDate: string
    ) => {
        setStartDate(startDate);
        setEndDate(endDate);
        setDateRange(dateRange);
    };

    useEffect(() => {
        const selectedRow = data.filter((d) => d.selected);
        setSelctedRows(selectedRow);
    }, [data]);

    useEffect(() => {
        if (dateRange || selectedFileType) {
            handleSearch(true);
        }
    }, [dateRange, selectedFileType]);

    useEffect(() => {
        if (state.data && state.data.length > 0) {
            setData(
                state.data.map((item) => {
                    return {
                        documentId: item.documentId.toString(),
                        name: item.name,
                        source: "Manual",
                        date: item.date,
                        selected: false,
                    };
                })
            );
            setTotalPages(state.totalPages);
            setCurrentPage(state.page);
        } else fetchFeedData();
    }, [rowsPerPage, currentPage, state]);
    useEffect(() => {
        if (shouldRefresh) {
            fetchFeedData();
        }
    }, [shouldRefresh]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") {
                handleNextPage();
            } else if (event.key === "ArrowLeft") {
                handlePrevPage();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // if (showAnalyse) return <LLM inputFiles={selectedRows} />;
    // else
    return (
        <div className="flex h-[100%]">
            <div
                className={`${
                    theme === "dark" ? "text-white" : "text-black"
                } p-6 rounded-2xl flex flex-col h-full w-1/2`}
            >
                {(loading || isLoading) && <Loader />}
                {searchPlaceholder && (
                    <h1 className="mb-2 h-[24px]">
                        Search Results for {searchPlaceholder}
                    </h1>
                )}
                <div
                    className={`flex items-center flex-grow ${
                        theme === "dark" ? "bg-gray-800" : "bg-white"
                    }  rounded-xs overflow-hidden shadow-md mb-4 w-1/2 h-[40px]`}
                >
                    <Search
                        className={`${
                            theme === "dark" ? "text-gray-400" : "text-black"
                        } ml-3 w-5 h-5`}
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className={`${
                            theme === "dark" ? "text-gray-300" : "text-black"
                        } flex-grow bg-transparent  px-3 py-2 focus:outline-none`}
                    />
                    {searchTerm && (
                        <X
                            className={`${
                                theme === "dark"
                                    ? "text-gray-400"
                                    : "text-black"
                            } mr-3 w-5 h-5 cursor-pointer`}
                            onClick={() => setSearchTerm("")}
                        />
                    )}
                </div>
                <div className="mb-4 flex items-center gap-4">
                    <FileTypeDropdown
                        selectedValue={selectedFileType}
                        setSelectedValue={setSelectedFileType}
                    />
                    <DateRangeDropdown
                        handleDateSelection={handleDateSelection}
                    />

                    {selectedRows.length > 0 && (
                        <CustomButton
                            label="Download"
                            onClick={() => handleDownloadFile()}
                            standAlone
                            theme={theme}
                            icon={<Download className="w-4 h-4" />}
                            title="Download selected files"
                        />
                    )}
                    <input
                        type="file"
                        id="file"
                        ref={tableFileUplode}
                        hidden={true}
                        onChange={onChangeFileUpload}
                        // onClick={(event) => {
                        //     event.currentTarget.value = null;
                        // }}
                        multiple
                    />
                </div>
                <Card
                    className={`${
                        theme === "dark" ? "bg-[#1E212F]" : "bg-white"
                    } rounded-[8px] h-[calc(100%-80px)] overflow-y-auto scrollbar-width[thin] flex flex-col justify-between rounded-b-none`}
                >
                    <Table>
                        <TableHead theme={theme}>
                            <TableRow theme={theme}>
                                <TableCell theme={theme}>
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        title="Select all rows"
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell
                                    onClick={() => handleSort("name")}
                                    className="cursor-pointer"
                                    theme={theme}
                                >
                                    Name
                                </TableCell>
                                {/* <TableCell
                                    onClick={() => handleSort("source")}
                                    className="cursor-pointer"
                                >
                                    Source
                                </TableCell> */}
                                <TableCell
                                    onClick={() => handleSort("date")}
                                    className="cursor-pointer"
                                    theme={theme}
                                >
                                    Date Created
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((item, index) => (
                                <TableRow key={index} theme={theme}>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={item.selected}
                                            // onChange={() => toggleSelect(index)}
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                toggleSelect(e, index);
                                            }}
                                            className="rounded"
                                            title={`Select row ${index + 1}`}
                                        />
                                    </TableCell>
                                    <TableCell
                                        onClick={() => handleFileClick(item)}
                                        theme={theme}
                                    >
                                        {item.name}
                                    </TableCell>
                                    {/* <TableCell>{"Manual"}</TableCell> */}
                                    <TableCell theme={theme}>
                                        {getLocalDateFromUTC(item.date)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
                {/* {data.filter((item) => item.selected).length > 0 ? (
        <div className="px-6 py-2 bg-gray-800">
            <AskQuestion
                inputData={data
                    .filter((item) => item.selected)
                    .map((item) => item.documentId)}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
            />
        </div>
    ) : null} */}
                <div
                    className={`flex justify-between items-center text-sm ${
                        theme === "dark" ? "bg-[#1E212F]" : "bg-white"
                    }  rounded-b-2xl p-6 mt-[0px]`}
                >
                    {/* <span>Rows per page: {rowsPerPage}</span> */}
                    <div
                        className={`flex items-center space-x-2 ${
                            theme === "dark" ? "bg-[#1E212F]" : "bg-white"
                        } px-4 py-2 rounded-md w-fit`}
                    >
                        <span
                            className={`${
                                theme === "dark" ? "text-white" : "text-black"
                            } text-lg`}
                        >
                            Rows per page:
                        </span>
                        <select
                            className={`bg-transparent ${
                                theme === "dark" ? "text-white" : "text-black"
                            } text-lg focus:outline-none`}
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            title="Rows per page"
                        >
                            {options.map((num) => (
                                <option
                                    key={num}
                                    value={num}
                                    className="text-black"
                                >
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`${
                                currentPage === 1
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : theme === "light"
                                    ? "bg-gray-200"
                                    : "bg-gray-600"
                            }`}
                            title="Previous Page"
                        >
                            <ChevronLeft
                                size={18}
                                color={`${
                                    theme === "light" ? "black" : "white"
                                }`}
                            />
                        </Button>
                        <span>
                            {currentPage} of {totalPages}
                        </span>
                        <Button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`${
                                currentPage === totalPages
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : theme === "light"
                                    ? "bg-gray-200"
                                    : "bg-gray-600"
                            }`}
                            title="Next Page"
                        >
                            <ChevronRight
                                size={18}
                                color={`${
                                    theme === "light" ? "black" : "white"
                                }`}
                            />
                        </Button>
                    </div>
                </div>
                {showDocumentModal && (
                    <CustomFileViewer
                        fileLocation={documentDetails}
                        docName={documentDetails.documentName}
                        jsonData={jsonData}
                        onClose={() => setShowDocumentModal(false)}
                        mimeType={mimeType}
                    />
                )}
                {show && (
                    <CustomNotification
                        seviority={type}
                        message={message}
                        duration={duration}
                        onClose={() => dispatch(clearNotifications())}
                    />
                )}
            </div>
            <div className="p-6 rounded-2xl h-full w-1/2">
                <LLM
                    inputFiles={showAnalyse ? selectedRows : []}
                    reload={reload}
                    setReload={setReload}
                    setShowAnalyse={setShowAnalyse}
                    showButton={selectedRows.length > 0}
                />
            </div>
        </div>
    );
};
export default FeedComponent;
