import { useEffect, useState } from "react";

const KEY = "theme";

export function getTheme() {
    try {
        return localStorage.getItem(KEY) === "light" ? "light" : "dark";
    } catch (e) {
        return "dark";
    }
}

export function applyTheme(theme) {
    document.documentElement.classList.toggle("light", theme === "light");
    try {
        localStorage.setItem(KEY, theme);
    } catch (e) {
        /* storage blocked: theme just won't persist */
    }
    window.dispatchEvent(new Event("themechange"));
}

export function useTheme() {
    const [theme, setTheme] = useState(getTheme);
    useEffect(() => {
        const sync = () => setTheme(getTheme());
        window.addEventListener("themechange", sync);
        return () => window.removeEventListener("themechange", sync);
    }, []);
    return theme;
}

// Apply the saved theme as soon as the app loads.
document.documentElement.classList.toggle("light", getTheme() === "light");
