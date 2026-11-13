import { applyTheme, useTheme } from "../theme";

function ThemeToggle() {
    const isLight = useTheme() === "light";
    return (
        <button
            type="button"
            role="switch"
            aria-checked={isLight}
            aria-label="Light theme"
            onClick={() => applyTheme(isLight ? "dark" : "light")}
            className="inline-flex items-center gap-2 min-h-[44px] text-xs font-semibold text-lo hover:text-hi"
        >
            <span className="relative w-[52px] h-7 rounded-full border border-line bg-surfaceRaised">
                <span
                    className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full transition-transform ${isLight ? "translate-x-6" : ""}`}
                    style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--violet)), rgb(var(--mint)))" }}
                />
            </span>
            <span className="hidden sm:inline w-9 text-left">{isLight ? "Light" : "Dark"}</span>
        </button>
    );
}

export default ThemeToggle;
