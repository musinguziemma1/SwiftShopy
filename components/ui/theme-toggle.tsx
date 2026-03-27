"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative w-14 h-8 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 border border-border shadow-inner"
        aria-label="Toggle theme"
      >
        <span className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative w-14 h-8 rounded-full border shadow-inner transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-r from-indigo-900 to-purple-900 border-indigo-700"
          : "bg-gradient-to-r from-amber-200 to-orange-200 border-amber-300"
      }`}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        className={`absolute top-1 w-6 h-6 rounded-full shadow-lg flex items-center justify-center ${
          isDark
            ? "bg-gradient-to-br from-indigo-400 to-purple-500 right-1"
            : "bg-gradient-to-br from-amber-400 to-orange-400 left-1"
        }`}
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-white" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-white" />
        )}
      </motion.div>
    </motion.button>
  );
}

export default ThemeToggle;
