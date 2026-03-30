"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

interface TimelineContentProps {
  as?: "div" | "span" | "article" | "section"
  animationNum: number
  timelineRef?: React.RefObject<HTMLElement>
  customVariants?: {
    visible: (i: number) => {
      y: number
      opacity: number
      filter: string
      transition: {
        delay: number
        duration: number
      }
    }
    hidden: {
      filter: string
      y: number
      opacity: number
    }
  }
  className?: string
  children: React.ReactNode
}

export function TimelineContent({
  as = "div",
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
}: TimelineContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const defaultVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  }

  const variants = customVariants || defaultVariants

  const MotionComponent = motion[as] || motion.div

  return (
    // @ts-ignore
    <MotionComponent
      ref={ref}
      className={className}
      custom={animationNum}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </MotionComponent>
  )
}
