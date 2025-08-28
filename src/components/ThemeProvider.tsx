import { useEffect, useState } from "react";
import ThemeContext from "./ThemeContext";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState("dark");
    const [showMenu, setShowMenu] = useState(true);
    const [reloadRecentSearch, setReloadRecentSearch] = useState(false);

    const updateTheme = (theme: string) => {
        localStorage.setItem("theme", theme);
        setTheme(theme);
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as
            | "light"
            | "dark"
            | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                updateTheme,
                showMenu,
                setShowMenu,
                reloadRecentSearch,
                setReloadRecentSearch,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};
