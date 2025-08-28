import React, { useEffect } from "react";
import { Menu, Search, UploadCloud } from "lucide-react";
import {
    fetchRecentSearches,
    fetchWorkspaceSearchResult,
} from "../services/HomeAPI";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import {
    fetchDataStart,
    fetchDataSuccess,
    mutateQuery,
    mutateSearchPlaceholder,
} from "../lib/feature/home";
import Loader from "./loader/Loader";
import { uploadFiles } from "../services/FeedAPI";
import CustomNotification from "./custom-notification/CustomNotification";
import { clearNotifications, showNotification } from "../lib/feature/toaster";
import { setRefreshAPI } from "../lib/feature/refreshAPI";
import { useTheme } from "./useTheme";
import TourPopup from "./tour-popup/Tour";
import { Link, useLocation, useNavigate } from "react-router-dom";

const sidebarItems = [
    {
        name: "Home",
        icon: "/images/home-icon.svg",
        black: "/images/home-icon-black.svg",
        path: "/",
    },
    {
        name: "Feed",
        icon: "/images/feed-icon.svg",
        black: "/images/feed-icon-black.svg",
        path: "/feeds",
    },
    {
        name: "Apps",
        icon: "/images/apps-icon.svg",
        black: "/images/apps-icon-black.svg",
        path: "/integration",
    },
];
const steps = [
    {
        title: "Upload Files",
        description: "Upload files directly from your desktop",
    },
    {
        title: "Feeds",
        description:
            "Incoming files will be displayed in the feed & analyze your documents with AI ",
    },
    {
        title: "Connect Apps",
        description: "Add files from connected apps.",
    },
];
interface RecentSearchResponse {
    searchRegistryId: number;
    searchText: string;
    userId: number;
    searchedOn: string;
}
const Sidebar: React.FC<{ handleMenuClick?: () => void }> = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const dispatch = useAppDispatch();
    const {
        theme,
        showMenu,
        setShowMenu,
        reloadRecentSearch,
        setReloadRecentSearch,
    } = useTheme();
    const [searchText, setSearchText] = React.useState("");
    const [recentSearches, setRecentSearches] = React.useState<
        RecentSearchResponse[]
    >([]);
    const [originalRecentSearches, setOriginalRecentSearches] = React.useState<
        RecentSearchResponse[]
    >([]);
    const { searchPlaceholder } = useAppSelector((state) => state.homePage);
    const { show, message, type, duration } = useAppSelector(
        (state) => state.toaster
    );
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [filteredSearch, setFilteredSearch] = React.useState(false);

    const [stepIndex, setStepIndex] = React.useState<number>(-1);

    const handleNext = () => {
        if (stepIndex < steps.length - 1) {
            setStepIndex((prev) => prev + 1);
        } else {
            setStepIndex(-1); // close tour
        }
    };

    const handleSkip = () => setStepIndex(-1);
    const handleClose = () => setStepIndex(-1);
    const getRecentSearches = async () => {
        try {
            const response = await fetchRecentSearches();
            if (response && response.length > 0) {
                setRecentSearches(
                    response.sort(
                        (a: RecentSearchResponse, b: RecentSearchResponse) =>
                            new Date(b.searchedOn).getTime() -
                            new Date(a.searchedOn).getTime()
                    )
                );
                setOriginalRecentSearches(
                    response.sort(
                        (a: RecentSearchResponse, b: RecentSearchResponse) =>
                            new Date(b.searchedOn).getTime() -
                            new Date(a.searchedOn).getTime()
                    )
                );
            }
        } catch (error) {
            console.error("Error fetching recent searches:", error);
            dispatch(
                showNotification({
                    message: "Error fetching recent searches",
                    type: "error",
                    duration: 5000,
                    show: true,
                })
            );
        }
    };

    const handleSearchClick = async (searchText: string) => {
        navigate("/feeds");
        try {
            dispatch(fetchDataStart());
            const result = await fetchWorkspaceSearchResult(
                {
                    searchString: searchText,
                    startDate: "",
                    endDate: "",
                    documentType: "",
                },
                false
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
                    selected: false,
                })
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
            dispatch(
                mutateSearchPlaceholder(searchText.replaceAll("&", " > "))
            );
            dispatch(mutateQuery(""));
        } catch (error) {
            dispatch(
                showNotification({
                    message: "Error fetching search results",
                    type: "error",
                    duration: 5000,
                    show: true,
                })
            );
            console.error("Error handling search click:", error);
        }
    };

    const handleDragEvents = (
        e: React.DragEvent<HTMLDivElement>,
        action: "enter" | "leave" | "over"
    ) => {
        e.preventDefault();
        e.stopPropagation();
        if (action === "enter" || action === "over") setIsDragging(true);
        else if (action === "leave") setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e, "leave");
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setIsLoading(true);
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append("file", file, encodeURIComponent(file.name));
            });
            try {
                await uploadFiles(formData);
                setIsLoading(false);
                dispatch(
                    showNotification({
                        show: true,
                        message: "Files uploaded successfully",
                        type: "success",
                        duration: 3000,
                    })
                );
                if (pathname.includes("feeds")) dispatch(setRefreshAPI(true));
            } catch (error) {
                setIsLoading(false);
                console.error("Error uploading files:", error);
                dispatch(
                    showNotification({
                        show: true,
                        message: "Error uploading files",
                        type: "error",
                        duration: 3000,
                    })
                );
            }
        }
    };

    const onChangeFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setIsLoading(true);
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append("file", file, encodeURIComponent(file.name));
            });
            try {
                await uploadFiles(formData);
                setIsLoading(false);
                dispatch(
                    showNotification({
                        show: true,
                        message: "Files uploaded successfully",
                        type: "success",
                        duration: 3000,
                    })
                );
                if (pathname.includes("feeds")) dispatch(setRefreshAPI(true));
            } catch (error) {
                setIsLoading(false);
                console.error("Error uploading files:", error);
                dispatch(
                    showNotification({
                        show: true,
                        message: "Error uploading files",
                        type: "error",
                        duration: 3000,
                    })
                );
            }
        }
    };

    useEffect(() => {
        if (searchText) {
            const filteredSearches = originalRecentSearches.filter((search) =>
                search.searchText
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
            );
            setRecentSearches(filteredSearches);
        } else {
            setRecentSearches(originalRecentSearches);
        }
    }, [searchText, originalRecentSearches]);
    useEffect(() => {
        getRecentSearches();
    }, []);
    useEffect(() => {
        if (searchPlaceholder) {
            getRecentSearches();
        }
    }, [searchPlaceholder]);
    useEffect(() => {
        console.log("reloadRecentSearch", reloadRecentSearch);
        if (reloadRecentSearch) {
            getRecentSearches();
            setReloadRecentSearch(false);
        }
    }, [reloadRecentSearch]);

    if (!showMenu)
        return (
            <div
                className={`${
                    theme === "dark" ? "text-gray-300" : "text-black"
                } mb-6 p-6 absolute cursor-pointer z-50`}
                onClick={() => {
                    setShowMenu(true);
                }}
                title="Open Sidebar"
            >
                <Menu size={28} />
            </div>
        );
    return (
        <div
            className={`w-64 h-screen relative ${
                theme === "dark"
                    ? "bg-[#21242C] text-gray-300"
                    : "bg-[#F4F7FB] text-black"
            } p-6 flex flex-col`}
        >
            <div
                className={`${
                    theme === "dark" ? "text-gray-300" : "text-black"
                } mb-4 ml-1.5 cursor-pointer`}
                onClick={() => {
                    setShowMenu(false);
                }}
                title="Close Sidebar"
            >
                <Menu size={28} />
            </div>
            <nav className="flex flex-col gap-2 mb-4 cursor-pointer">
                {sidebarItems.map((item, index) => {
                    const isActive =
                        pathname === item.path || item.path + "/" === pathname;

                    return (
                        <Link
                            key={item.name}
                            className={`${
                                theme === "dark"
                                    ? `text-gray-300 hover:text-white hover:bg-gray-700 ${
                                          isActive ? "bg-gray-600" : ""
                                      }`
                                    : `text-black hover:text-black hover:bg-gray-200 ${
                                          isActive ? "bg-gray-300" : ""
                                      }`
                            } flex items-center gap-4 text-lg p-2 rounded-md ${
                                index === stepIndex ? "relative" : ""
                            }`}
                            to={item.path}
                            onClick={() => {
                                dispatch(
                                    fetchDataSuccess({
                                        data: [],
                                        originalData: [],
                                        page: 0,
                                        pageSize: 0,
                                        totalPages: 0,
                                        totalRecords: 0,
                                    })
                                );
                                dispatch(mutateQuery(""));
                                dispatch(mutateSearchPlaceholder(""));
                            }}
                            title={item.name}
                        >
                            <img
                                src={theme === "light" ? item.black : item.icon}
                                alt={`${item.name} Icon`}
                                width={24}
                                height={24}
                            />

                            <span className="text-[14px] font-bold">
                                {item.name}
                            </span>
                            {stepIndex >= 0 &&
                                stepIndex === index &&
                                index !== 0 && (
                                    <div className="absolute left-[100%] w-full ml-3.5">
                                        <TourPopup
                                            step={stepIndex + 1}
                                            totalSteps={steps.length}
                                            title={steps[stepIndex].title}
                                            description={
                                                steps[stepIndex].description
                                            }
                                            onNext={handleNext}
                                            onSkip={handleSkip}
                                            onClose={handleClose}
                                        />
                                    </div>
                                )}
                        </Link>
                    );
                })}
            </nav>
            <div
                onDragEnter={(e) => handleDragEvents(e, "enter")}
                onDragLeave={(e) => handleDragEvents(e, "leave")}
                onDragOver={(e) => handleDragEvents(e, "over")}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-5 border-2 mb-6 rounded-xl cursor-pointer transition-colors duration-300 ${
                    isDragging
                        ? "border-blue-500 bg-blue-50"
                        : `border-slate-300 ${
                              theme === "dark"
                                  ? "hover:border-gray-600 hover:bg-gray-700"
                                  : "hover:border-gray-600 hover:bg-gray-200"
                          }`
                } ${stepIndex === 0 ? "relative" : ""}`}
                title="Drag & drop files or click to browse"
            >
                <UploadCloud
                    className={`"w-10 h-10 ${
                        theme === "dark" ? "text-gray-300" : "text-black"
                    }`}
                />
                <p
                    className={`text-xs font-semibold text-center ${
                        theme === "dark" ? "text-gray-300" : "text-black"
                    } `}
                >
                    Drag & drop files or click to browse
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onChangeFileUpload}
                    multiple
                    className="hidden"
                    title="Upload files"
                    placeholder="Select files to upload"
                />
                {stepIndex === 0 && (
                    <div className="absolute left-[100%] w-full ml-3.5">
                        <TourPopup
                            step={stepIndex + 1}
                            totalSteps={steps.length}
                            title={steps[stepIndex].title}
                            description={steps[stepIndex].description}
                            onNext={handleNext}
                            onSkip={handleSkip}
                            onClose={handleClose}
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center h-[calc(100%-335px)]">
                <div className="relative mb-1">
                    <Search
                        size={20}
                        className="absolute top-[10px] left-[12px] text-gray-400"
                    />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search..."
                        className={`w-full ${
                            theme === "dark"
                                ? "bg-gray-700 text-gray-200"
                                : "bg-white text-[#151A30]"
                        } pl-10 pr-1 py-2 rounded-md focus:outline-none`}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setFilteredSearch(true);
                                console.log("Searching for:", searchText);
                            }
                        }}
                        title="Search recent searches"
                    />
                </div>
                {/* {recentSearches.length > 0 && ( */}
                <div
                    className="w-full rounded-md mt-2 overflow-y-auto overflow-x-hidden relative"
                    style={{ scrollbarWidth: "none" }}
                >
                    <h3
                        className={`text-sm font-semibold px-2.5 py-3 mb-2 ${
                            theme === "dark"
                                ? "text-gray-300 bg-gray-800"
                                : "text-[#151A30] bg-white"
                        } sticky top-0 left-0  w-full`}
                    >
                        {`${
                            filteredSearch ||
                            recentSearches.length <
                                originalRecentSearches.length
                                ? "Filtered Search"
                                : "Recent Searches"
                        } `}
                    </h3>
                    <div className="space-y-1">
                        {recentSearches.length === 0 && (
                            <div
                                className={`text-sm ${
                                    theme === "dark"
                                        ? "text-gray-400 hover:text-white hover:bg-gray-700"
                                        : "text-[#151A30] hover:text-[#151A30] hover:bg-gray-200"
                                } cursor-pointer px-2.5 py-3 rounded-md  transition-colors"`}
                                onClick={() => {}}
                            >
                                No search found
                            </div>
                        )}
                        {recentSearches.map((search, index) => (
                            <div
                                key={index}
                                className={`text-sm ${
                                    theme === "dark"
                                        ? "text-gray-400 hover:text-white hover:bg-gray-700"
                                        : "text-[#151A30] hover:text-[#151A30] hover:bg-gray-200"
                                } cursor-pointer px-2.5 py-3 rounded-md  transition-colors"`}
                                onClick={() => {
                                    handleSearchClick(search.searchText);
                                }}
                                title={search.searchText}
                            >
                                {search.searchText.replaceAll("&", " > ") ||
                                    "No recent searches"}
                            </div>
                        ))}
                    </div>
                </div>
                {/* )} */}
            </div>
            {isLoading && <Loader />}
            {show && (
                <CustomNotification
                    seviority={type}
                    message={message}
                    duration={duration}
                    onClose={() => dispatch(clearNotifications())}
                />
            )}
        </div>
    );
};

export default Sidebar;
