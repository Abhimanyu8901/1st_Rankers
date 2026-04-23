import { Moon, Sun } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useAuth();

  return (
    <button
      onClick={toggleTheme}
      className="btn-secondary gap-2"
      type="button"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {theme === "dark" ? "Light" : "Dark"} mode
    </button>
  );
};
