"use client"

import React from "react"
import { motion } from "framer-motion"

interface BackgroundPathsProps {
  className?: string
}

const paths = [
  "M-200 400 C 100 200, 300 600, 600 300 S 900 100, 1200 400",
  "M0 600 C 200 300, 400 700, 700 400 S 1000 200, 1400 500",
  "M100 100 C 300 400, 500 0, 800 300 S 1100 500, 1500 200",
  "M-100 800 C 200 500, 500 900, 800 600 S 1100 300, 1400 700",
  "M200 0 C 400 300, 600 -100, 900 200 S 1200 500, 1600 100",
  "M0 300 C 300 100, 600 500, 900 200 S 1200 400, 1600 300",
]

export function BackgroundPaths({ className = "" }: BackgroundPathsProps) {
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
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1400 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0 }}
      >
        {paths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="rgba(59,130,246,0.08)"
            strokeWidth={i % 2 === 0 ? 2 : 1.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 3 + i * 0.5,
              ease: "easeInOut",
              delay: i * 0.3,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1,
            }}
          />
        ))}
        {/* Gradient blobs */}
        <circle cx="200" cy="200" r="300" fill="rgba(59,130,246,0.03)" />
        <circle cx="1200" cy="600" r="250" fill="rgba(99,102,241,0.03)" />
        <circle cx="700" cy="400" r="200" fill="rgba(139,92,246,0.02)" />
      </svg>
    </div>
  )
}

export default BackgroundPaths
