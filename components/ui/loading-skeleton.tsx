"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
}

/**
 * Reusable loading skeleton component for async content
 * Use this to replace loading spinners with proper skeleton UI
 */
export function LoadingSkeleton({ 
  className, 
  variant = "rectangular", 
  width, 
  height 
}: LoadingSkeletonProps) {
  const baseStyles = "animate-pulse bg-accent"
  
  const variantStyles = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  }

  const style = {
    width: width || "100%",
    height: height || (variant === "text" ? "1rem" : variant === "circular" ? "40px" : "100px"),
  }

  return (
    <div 
      className={cn(baseStyles, variantStyles[variant], className)} 
      style={style}
    />
  )
}

/**
 * Table row skeleton for loading states
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <LoadingSkeleton variant="text" width="60%" height="1rem" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Card skeleton for dashboard widgets
 */
export function CardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <LoadingSkeleton variant="text" width="40%" height="1.25rem" className="mb-4" />
      <LoadingSkeleton variant="text" width="60%" height="2rem" className="mb-2" />
      <LoadingSkeleton variant="text" width="30%" height="0.875rem" />
    </div>
  )
}

/**
 * Chart skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <LoadingSkeleton variant="text" width="30%" height="1.25rem" className="mb-6" />
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 7 }).map((_, i) => (
          <LoadingSkeleton 
            key={i} 
            variant="rectangular" 
            width="40px" 
            height={Math.random() * 80 + 20}
            className="flex-1"
          />
        ))}
      </div>
    </div>
  )
}

/**
 * List item skeleton
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
      <LoadingSkeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <LoadingSkeleton variant="text" width="60%" height="1rem" className="mb-2" />
        <LoadingSkeleton variant="text" width="40%" height="0.875rem" />
      </div>
    </div>
  )
}

/**
 * Full page loading state
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingSkeleton