import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// interface fileData {
//     allowDownload: "true" | "false";
//     clickActionParameters: string;
//     createdOn: string;
//     isEditable: boolean;
//     isShared: boolean;
//     isStarred: boolean | null;
//     objectId: number;
//     objectLocation: string;
//     objectName: string;
//     objectType: string;
//     sharedBy: number;
//     updatedOn: string;
// }
interface DataItem {
    name: string;
    date: string;
    documentId: number;
    selected: boolean;
}
interface HomePageData {
    data: DataItem[];
    originalData: DataItem[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
}
interface HomePageState {
    state: HomePageData;
    loading: boolean;
    error: string | null;
    query: string;
    searchPlaceholder: string;
    sortOrder: "asc" | "desc";
}

export const fetchDataSuccessAction = (
    data: HomePageData
): PayloadAction<HomePageData> => {
    return {
        type: "homePage/fetchDataSuccess",
        payload: data,
    };
};

const initialState: HomePageState = {
    state: {
        data: [],
        originalData: [],
        page: 0,
        pageSize: 0,
        totalPages: 0,
        totalRecords: 0,
    },
    query: "",
    searchPlaceholder: "",
    sortOrder: "asc",
    loading: false,
    error: null,
};

const homePageSlice = createSlice({
    name: "homePage",
    initialState,
    reducers: {
        fetchDataStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchDataSuccess(state, action: PayloadAction<HomePageData>) {
            state.loading = false;
            state.state = action.payload;
        },
        fetchDataFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        mutateData(state, action: PayloadAction<HomePageData>) {
            state.state = { ...state.state, ...action.payload };
        },
        mutateQuery(state, action: PayloadAction<string>) {
            state.query = action.payload;
        },
        mutateSearchPlaceholder(state, action: PayloadAction<string>) {
            state.searchPlaceholder = action.payload;
        },
        mutateSort(state, action: PayloadAction<"asc" | "desc">) {
            state.sortOrder = action.payload;
        },
    },
});

export const {
    fetchDataStart,
    fetchDataSuccess,
    fetchDataFailure,
    mutateData,
    mutateQuery,
    mutateSort,
    mutateSearchPlaceholder,
} = homePageSlice.actions;

export default homePageSlice;
