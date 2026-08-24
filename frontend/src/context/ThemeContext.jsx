import { createContext, useCallback, useContext, useEffect, useState } from "react";
import AuthContext from "./AuthContext";

const ThemeContext = createContext(null);
const STORAGE_KEY = "theme";
const THEMES = ["light", "dark", "system"];

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(theme) {
  return theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : "system";
  });
  // Bumped only when the OS preference changes while theme === "system", to
  // force a re-render — resolvedTheme below is recomputed fresh each render.
  const [, forceRerender] = useState(0);

  const resolvedTheme = resolveTheme(theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  useEffect(() => {
    if (theme !== "system") return;

    // Keep following the OS preference live while "System" is selected.
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange() {
      forceRerender((n) => n + 1);
    }
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return;
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  // Once the logged-in user loads, their persisted preference takes over
  // from whatever localStorage held (guest default or a previous account).
  // Adjusted during render (React's recommended pattern for syncing state to
  // an external value) rather than in an effect, to avoid an extra render.
  const auth = useContext(AuthContext);
  const userThemePreference = auth?.user?.theme_preference;
  const [syncedUserThemePreference, setSyncedUserThemePreference] = useState(userThemePreference);
  if (userThemePreference !== syncedUserThemePreference) {
    setSyncedUserThemePreference(userThemePreference);
    if (THEMES.includes(userThemePreference)) {
      localStorage.setItem(STORAGE_KEY, userThemePreference);
      setThemeState(userThemePreference);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
