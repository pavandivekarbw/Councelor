import { configureStore } from "@reduxjs/toolkit";
import homePageSlice from "./feature/home"; // Adjust the path as needed
import toasterSlice from "./feature/toaster"; // Adjust the path as needed
import refreshAPI from "./feature/refreshAPI"; // Adjust the path as needed

export const store = () => {
    return configureStore({
        reducer: {
            homePage: homePageSlice.reducer,
            refreshAPI: refreshAPI,
            toaster: toasterSlice.reducer, // Ensure you import toasterSlice from the correct file:
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }),
    });
};

// Infer the type of store
export type AppStore = ReturnType<typeof store>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
