"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

interface BackgroundPathsProps {
  className?: string;
  variant?: "hero" | "section" | "minimal";
}

// Generate smooth bezier curves based on viewport
function generatePaths(count: number, seed: number = 0) {
  const paths: string[] = [];
  for (let i = 0; i < count; i++) {
    const y1 = 100 + Math.sin(seed + i * 1.5) * 150 + i * 80;
    const y2 = 200 + Math.cos(seed + i * 2.1) * 100 + i * 60;
    const y3 = 300 + Math.sin(seed + i * 0.8) * 120 + i * 70;
    const y4 = 150 + Math.cos(seed + i * 1.7) * 130 + i * 50;

    paths.push(
      `M -100 ${y1} C ${100 + i * 150} ${y2}, ${300 + i * 100} ${y3}, ${600 + i * 150} ${y4}`
    );
  }
  return paths;
}

export function BackgroundPaths({ className = "", variant = "hero" }: BackgroundPathsProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    setPaths(generatePaths(8, Date.now() * 0.001));
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const strokeColor = isDark
    ? "rgba(99, 102, 241, 0.12)"
    : "rgba(59, 130, 246, 0.08)";

  const gradientColors = isDark
    ? ["rgba(99, 102, 241, 0.04)", "rgba(139, 92, 246, 0.03)", "rgba(59, 130, 246, 0.02)"]
    : ["rgba(59, 130, 246, 0.03)", "rgba(99, 102, 241, 0.02)", "rgba(139, 92, 246, 0.015)"];

  const blobCount = variant === "minimal" ? 2 : variant === "section" ? 3 : 5;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
      aria-hidden="true"
    >
      {/* Gradient Mesh Background */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? `radial-gradient(ellipse at 20% 20%, ${gradientColors[0]} 0%, transparent 50%),
               radial-gradient(ellipse at 80% 30%, ${gradientColors[1]} 0%, transparent 50%),
               radial-gradient(ellipse at 50% 80%, ${gradientColors[2]} 0%, transparent 50%)`
            : `radial-gradient(ellipse at 20% 20%, ${gradientColors[0]} 0%, transparent 50%),
               radial-gradient(ellipse at 80% 30%, ${gradientColors[1]} 0%, transparent 50%),
               radial-gradient(ellipse at 50% 80%, ${gradientColors[2]} 0%, transparent 50%)`,
        }}
      />

      {/* Animated SVG Paths */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1400 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Define gradients */}
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#6366f1" : "#3b82f6"} stopOpacity="0.3" />
            <stop offset="50%" stopColor={isDark ? "#8b5cf6" : "#6366f1"} stopOpacity="0.2" />
            <stop offset="100%" stopColor={isDark ? "#3b82f6" : "#8b5cf6"} stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Animated paths */}
        {paths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={strokeColor}
            strokeWidth={i % 2 === 0 ? 2 : 1.5}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 + (i % 3) * 0.15 }}
            transition={{
              duration: 4 + i * 0.5,
              ease: "easeInOut",
              delay: i * 0.3,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 2,
            }}
          />
        ))}

        {/* Floating gradient orbs */}
        {[...Array(blobCount)].map((_, i) => {
          const cx = 150 + i * 280;
          const cy = 100 + Math.sin(i * 1.2) * 200 + i * 80;
          const r = 100 + i * 40;
          return (
            <motion.circle
              key={`orb-${i}`}
              cx={cx}
              cy={cy}
              r={r}
              fill={gradientColors[i % 3]}
              animate={{
                cx: [cx, cx + 50, cx - 30, cx],
                cy: [cy, cy - 40, cy + 30, cy],
                r: [r, r + 20, r - 10, r],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Grid pattern overlay */}
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            stroke={isDark ? "rgba(99, 102, 241, 0.03)" : "rgba(59, 130, 246, 0.03)"}
            strokeWidth="1"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}

export default BackgroundPaths;
