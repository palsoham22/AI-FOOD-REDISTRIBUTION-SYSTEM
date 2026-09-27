import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const THEMES = {
    LIGHT: "light",
    DARK: "dark"
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem("foodbridge_theme");
            return saved === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
        } catch (e) {
            return THEMES.LIGHT;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("foodbridge_theme", theme);
            document.documentElement.setAttribute("data-theme", theme);
            if (document.body) {
                document.body.setAttribute("data-theme", theme);
            }
        } catch (e) {
            console.error("Theme storage error:", e);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
    };

    const isDark = theme === THEMES.DARK;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
