// ThemeContext.tsx
import { createContext } from "react";

const ThemeContext = createContext<{
    theme: string;
    updateTheme: (theme: string) => void;
    showMenu: boolean;
    setShowMenu: (value: boolean) => void;
    reloadRecentSearch: boolean;
    setReloadRecentSearch: (value: boolean) => void;
} | null>(null);

export default ThemeContext;
