import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
type Theme = "dark" | "light";
interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("snakes_theme");
    if (saved === "light" || saved === "dark") return saved;
    return "dark";
  });
  useEffect(() => {
    localStorage.setItem("snakes_theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);
  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () =>
    setThemeState((p) => (p === "dark" ? "light" : "dark"));
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
