import { AnimatedThemeToggler } from "./landing/ui/animated-theme-toggler";
import { setTheme, useTheme } from "./theme";

/** Alternador de tema com revelação circular (Magic UI). Usado na landing e no laboratório. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  return <AnimatedThemeToggler theme={theme} onThemeChange={setTheme} duration={650}
    className={`tt-btn ${className}`} />;
}
