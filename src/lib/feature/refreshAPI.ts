import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const refreshAPI = createSlice({
    name: "refreshAPI",
    initialState: {
        shouldRefresh: false,
        error: null,
    },
    reducers: {
        setRefreshAPI(state, action: PayloadAction<boolean>) {
            state.shouldRefresh = action.payload;
            state.error = null;
        },
    },
});

export const { setRefreshAPI } = refreshAPI.actions;

export default refreshAPI.reducer;
