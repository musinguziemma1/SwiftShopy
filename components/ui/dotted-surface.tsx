"use client"

import React from "react"

interface DottedSurfaceProps {
  className?: string
  dotColor?: string
  dotSize?: number
  dotSpacing?: number
}

export function DottedSurface({
  className = "",
  dotColor = "currentColor",
  dotSize = 1.5,
  dotSpacing = 24,
}: DottedSurfaceProps) {
  return (
    <div
      className={className}
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor === "currentColor" ? "rgba(59,130,246,0.25)" : dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
        backgroundPosition: "0 0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  )
}

export default DottedSurface
