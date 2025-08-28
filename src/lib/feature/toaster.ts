import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface ToastNotification {
    show: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
    duration?: number; // in ms
}

const initialState: ToastNotification = {
    show: false,
    message: "",
    type: "success", // default type
    duration: 3000, // default duration
};

const toasterSlice = createSlice({
    name: "toaster",
    initialState,
    reducers: {
        showNotification: (state, action: PayloadAction<ToastNotification>) => {
            const { show, message, type, duration } = action.payload;
            state.show = show;
            state.message = message;
            state.type = type;
            state.duration = duration ?? initialState.duration; // use default if not provided
        },
        clearNotifications: () => initialState,
    },
});

export const { showNotification, clearNotifications } = toasterSlice.actions;

export default toasterSlice;
