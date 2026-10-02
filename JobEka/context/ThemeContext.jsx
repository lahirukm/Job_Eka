import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const DARK = {
  bg:         "#0A0F1E",
  surface:    "#111827",
  surface2:   "#0D1525",
  border:     "#1E2D40",
  text:       "#FFFFFF",
  textSub:    "#64748B",
  textLight:  "#4A5568",
  primary:    "#1A2EFF",
  primaryBg:  "#0D1A35",
  green:      "#00D4AA",
  greenBg:    "#0D2518",
  orange:     "#FF6B35",
  orangeBg:   "#2D1A0D",
  purple:     "#A855F7",
  purpleBg:   "#1A0D2D",
  statusBar:  "light-content",
};

export const LIGHT = {
  bg:         "#F5F4F0",
  surface:    "#FFFFFF",
  surface2:   "#F0EEE9",
  border:     "#E8E5DF",
  text:       "#1A1A2E",
  textSub:    "#6B7280",
  textLight:  "#9CA3AF",
  primary:    "#2563EB",
  primaryBg:  "#EEF2FF",
  green:      "#059669",
  greenBg:    "#ECFDF5",
  orange:     "#EA580C",
  orangeBg:   "#FFF7ED",
  purple:     "#7C3AED",
  purpleBg:   "#F5F3FF",
  statusBar:  "dark-content",
};

// Palettes used by the Login and Register screens
export const AUTH = {
  dark: {
    bg: "#0A0F1E", card: "#111827", inputBg: "#0D1525", border: "#1E2D40",
    text: "#FFFFFF", textSub: "#64748B", textLight: "#4A5568", textMuted: "#94A3B8", textFaint: "#2D3748",
    primary: "#1A2EFF", primaryBg: "#0D1A35", primarySoft: "#1A2EFF22", onPrimary: "#FFFFFF",
    green: "#00D4AA", greenBg: "#1A2D0D", orange: "#FF6B35", orangeBg: "#2D1A0D",
    error: "#FF6B6B", errorBorder: "#FF4444", errorBg: "#2D1515",
    statusBar: "light-content", cardShadow: "#000000",
  },
  light: {
    bg: "#F5F7FB", card: "#FFFFFF", inputBg: "#F8FAFC", border: "#E2E8F0",
    text: "#0F172A", textSub: "#64748B", textLight: "#94A3B8", textMuted: "#475569", textFaint: "#94A3B8",
    primary: "#2563EB", primaryBg: "#EEF2FF", primarySoft: "#2563EB14", onPrimary: "#FFFFFF",
    green: "#059669", greenBg: "#ECFDF5", orange: "#EA580C", orangeBg: "#FFF7ED",
    error: "#DC2626", errorBorder: "#FCA5A5", errorBg: "#FEF2F2",
    statusBar: "dark-content", cardShadow: "#94A3B8",
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false); // light mode by default

  // Remember the user's choice between app launches
  useEffect(() => {
    AsyncStorage.getItem("theme_mode").then((v) => { if (v) setIsDark(v === "dark"); }).catch(() => {});
  }, []);

  const toggleTheme = () => setIsDark((p) => {
    const next = !p;
    AsyncStorage.setItem("theme_mode", next ? "dark" : "light").catch(() => {});
    return next;
  });
  const theme = isDark ? DARK : LIGHT;
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
