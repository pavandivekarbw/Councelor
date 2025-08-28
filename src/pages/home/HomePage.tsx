"use client";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "../../components/Button";
import Loader from "../../components/loader/Loader";

import { fetchWorkspaceSearchResult } from "../../services/HomeAPI";
import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import {
    fetchDataStart,
    fetchDataSuccess,
    mutateQuery,
    mutateSearchPlaceholder,
} from "../../lib/feature/home";
import CustomFileViewer from "../../components/file-viewer/CustomFileViewer";
import CustomNotification from "../../components/custom-notification/CustomNotification";
import {
    clearNotifications,
    showNotification,
} from "../../lib/feature/toaster";
import { useTheme } from "../../components/useTheme";
import FeedComponent from "../feeds/Feeds";
import { getUTCDateFromLocal } from "../../util/helper";

interface DataItem {
    name: string;
    date: string;
    documentId: number;
    selected: boolean;
}

interface DocumentDetails {
    documentId: number;
    documentName: string;
    documentLocation: string;
    documentStream: string;
}

const HomePage: React.FC = () => {
    const { theme } = useTheme();
    const { state, loading, query, searchPlaceholder } = useAppSelector(
        (state) => state.homePage
    );
    const { show, message, type, duration } = useAppSelector(
        (state) => state.toaster
    );
    const dispatch = useAppDispatch();
    const { page, totalPages: totalPage } = state;
    // const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFileType] = useState<string>("");
    const [startDate] = useState<string>("");
    const [endDate] = useState<string>("");
    const [dateRange] = useState<string>("");
    const [showDocumentModal, setShowDocumentModal] = useState<boolean>(false);
    const [documentDetails] = useState<DocumentDetails>({
        documentId: 0,
        documentName: "",
        documentLocation: "",
        documentStream: "",
    });
    const [jsonData] = useState<string>("");
    const [rowsPerPage] = useState<number>(10);
    const handleSearch = async (filterSearch?: boolean) => {
        if (!query.trim() && !searchPlaceholder) return;
        if (query.trim() || filterSearch) {
            try {
                dispatch(fetchDataStart());
                const result = await fetchWorkspaceSearchResult(
                    {
                        searchString: !searchPlaceholder
                            ? query
                            : filterSearch
                            ? searchPlaceholder.replace(" > ", "&")
                            : searchPlaceholder.replace(" > ", "&") +
                              "&" +
                              query,
                        startDate: getUTCDateFromLocal(startDate),
                        endDate: getUTCDateFromLocal(endDate),
                        documentType: selectedFileType.toLocaleUpperCase(),
                    },
                    true,
                    currentPage,
                    rowsPerPage
                );
                const data = result.data
                    .map(
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
                            selected: false,
                        })
                    )
                    .sort(
                        (a: DataItem, b: DataItem) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                    );
                dispatch(
                    fetchDataSuccess({
                        data,
                        originalData: data,
                        page: result.page || 1,
                        pageSize: result.pageSize || 100,
                        totalPages: result.totalPages || 1,
                        totalRecords: result.totalRecords || 0,
                    })
                );
                if (query.trim())
                    dispatch(
                        mutateSearchPlaceholder(
                            !searchPlaceholder
                                ? query
                                : searchPlaceholder + " > " + query
                        )
                    );
                dispatch(mutateQuery(""));
            } catch (error) {
                console.error(error);
                dispatch(
                    showNotification({
                        show: true,
                        message: "Something went wrong",
                        type: "error",
                        duration: 3000,
                    })
                );
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        if (selectedFileType) {
            handleSearch(true);
        }
    }, [selectedFileType]);

    useEffect(() => {
        if (dateRange) {
            handleSearch(true);
        }
    }, [dateRange]);
    useEffect(() => {
        setCurrentPage(1);
    }, [totalPage]);
    useEffect(() => {
        handleSearch(true);
    }, [rowsPerPage, currentPage]);

    if (page > 0) return <FeedComponent />;
    return (
        <div className="flex flex-col items-center justify-center h-full  gap-8">
            {loading || isLoading ? (
                <Loader />
            ) : (
                <React.Fragment>
                    <div className="flex items-center gap-3">
                        <svg
                            width="74"
                            height="64"
                            viewBox="0 0 74 64"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M37.5679 31.6367L18.7817 63.2734H54.7706L73.1587 31.6367H37.5679Z"
                                fill="#2484C6"
                            />
                            <path
                                d="M55.3605 0L37.5674 31.6367H73.1582L55.3605 0Z"
                                fill="#1B75BC"
                            />
                            <path
                                d="M37.5678 31.6367L18.7817 0L0 31.6367L18.7817 63.2735L37.5678 31.6367Z"
                                fill="#27AAE1"
                            />
                        </svg>
                        <h1
                            className={`text-2xl ${
                                theme === "dark"
                                    ? "text-white"
                                    : "text-[#171923]"
                            } font-semibold`}
                        >
                            Unity Central
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 w-96">
                        <div
                            className={`flex items-center flex-grow ${
                                theme === "dark"
                                    ? "bg-gray-800"
                                    : "bg-[#F4F7FB]"
                            } rounded-xs overflow-hidden shadow-md`}
                        >
                            <Search
                                className={` ${
                                    theme === "dark"
                                        ? "text-gray-400"
                                        : "text-black"
                                } ml-3 w-5 h-5`}
                            />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={query}
                                onChange={(e) =>
                                    dispatch(mutateQuery(e.target.value))
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSearch()
                                }
                                className={`flex-grow bg-transparent ${
                                    theme === "dark"
                                        ? "text-gray-400"
                                        : "text-black"
                                } px-3 py-2 focus:outline-none`}
                            />
                        </div>
                        <Button
                            onClick={() => handleSearch()}
                            className="rounded-xs"
                            title="Search Documents"
                        >
                            Search
                        </Button>
                    </div>
                    {showDocumentModal && (
                        <CustomFileViewer
                            fileLocation={documentDetails}
                            docName={documentDetails.documentName}
                            onClose={() => setShowDocumentModal(false)}
                            jsonData={jsonData}
                        />
                    )}
                    {show && (
                        <CustomNotification
                            message={message}
                            onClose={() => dispatch(clearNotifications())}
                            seviority={type}
                            duration={duration}
                        />
                    )}
                </React.Fragment>
            )}
        </div>
    );
};

export default HomePage;
