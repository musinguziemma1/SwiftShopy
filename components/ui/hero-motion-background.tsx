"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";

interface HeroMotionBackgroundProps {
  className?: string;
}

// Gradient orbs that float and pulse
function GradientOrbs({ isDark }: { isDark: boolean }) {
  const orbs = [
    {
      color: isDark ? "rgba(99, 102, 241, 0.15)" : "rgba(59, 130, 246, 0.12)",
      size: 600,
      x: "10%",
      y: "20%",
      duration: 25,
    },
    {
      color: isDark ? "rgba(139, 92, 246, 0.12)" : "rgba(139, 92, 246, 0.1)",
      size: 500,
      x: "70%",
      y: "10%",
      duration: 30,
    },
    {
      color: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(99, 102, 241, 0.08)",
      size: 450,
      x: "50%",
      y: "60%",
      duration: 35,
    },
    {
      color: isDark ? "rgba(236, 72, 153, 0.08)" : "rgba(236, 72, 153, 0.06)",
      size: 350,
      x: "85%",
      y: "70%",
      duration: 28,
    },
    {
      color: isDark ? "rgba(34, 197, 94, 0.08)" : "rgba(34, 197, 94, 0.06)",
      size: 300,
      x: "20%",
      y: "80%",
      duration: 32,
    },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 50, -30, 20, 0],
            y: [0, -40, 30, -20, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Animated mesh gradient
function MeshGradient({ isDark }: { isDark: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="meshGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#4f46e5" : "#3b82f6"} stopOpacity="0.08">
              <animate attributeName="stopOpacity" values="0.08;0.15;0.08" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor={isDark ? "#7c3aed" : "#6366f1"} stopOpacity="0.05">
              <animate attributeName="stopOpacity" values="0.05;0.12;0.05" dur="10s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor={isDark ? "#2563eb" : "#8b5cf6"} stopOpacity="0.08">
              <animate attributeName="stopOpacity" values="0.08;0.15;0.08" dur="12s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          
          <filter id="meshBlur">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>
        
        {/* Animated shapes */}
        <motion.ellipse
          cx="200"
          cy="200"
          rx="300"
          ry="200"
          fill="url(#meshGrad1)"
          filter="url(#meshBlur)"
          animate={{
            cx: [200, 350, 250, 200],
            cy: [200, 150, 300, 200],
            rx: [300, 350, 280, 300],
            ry: [200, 250, 220, 200],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.ellipse
          cx="700"
          cy="400"
          rx="250"
          ry="180"
          fill="url(#meshGrad1)"
          filter="url(#meshBlur)"
          animate={{
            cx: [700, 600, 750, 700],
            cy: [400, 350, 450, 400],
            rx: [250, 300, 270, 250],
            ry: [180, 200, 160, 180],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.ellipse
          cx="500"
          cy="300"
          rx="200"
          ry="250"
          fill="url(#meshGrad1)"
          filter="url(#meshBlur)"
          animate={{
            cx: [500, 550, 450, 500],
            cy: [300, 250, 350, 300],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

// Floating particles
function FloatingParticles({ isDark }: { isDark: boolean }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: isDark 
              ? `rgba(148, 163, 184, ${Math.random() * 0.3 + 0.1})` 
              : `rgba(99, 102, 241, ${Math.random() * 0.2 + 0.1})`,
          }}
          animate={{
            y: [0, -100, -200],
            x: [0, Math.random() * 50 - 25],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Animated grid lines
function GridLines({ isDark }: { isDark: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="gridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke={isDark ? "rgba(99, 102, 241, 0.08)" : "rgba(59, 130, 246, 0.06)"}
              strokeWidth="1"
            />
          </pattern>
          
          <linearGradient id="gridFade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          
          <mask id="gridMask">
            <rect width="100%" height="100%" fill="url(#gridFade)" />
          </mask>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#gridPattern)" mask="url(#gridMask)" />
      </svg>
    </div>
  );
}

// Animated wave lines
function WaveLines({ isDark }: { isDark: boolean }) {
  const paths = [
    "M 0 300 Q 250 200 500 300 T 1000 300",
    "M 0 350 Q 250 250 500 350 T 1000 350",
    "M 0 400 Q 250 300 500 400 T 1000 400",
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? "#6366f1" : "#3b82f6"} stopOpacity="0" />
            <stop offset="50%" stopColor={isDark ? "#8b5cf6" : "#6366f1"} stopOpacity="0.15" />
            <stop offset="100%" stopColor={isDark ? "#6366f1" : "#3b82f6"} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {paths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="url(#waveGrad)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          >
            <animate
              attributeName="d"
              values={`${d};${d.replace(/300/g, "280").replace(/350/g, "330").replace(/400/g, "380")};${d}`}
              dur={`${8 + i * 2}s`}
              repeatCount="indefinite"
            />
          </motion.path>
        ))}
      </svg>
    </div>
  );
}

// Mouse follower glow
function MouseGlow({ isDark }: { isDark: boolean }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });
  
  const glowX = useTransform(springX, (x) => `${x}px`);
  const glowY = useTransform(springY, (y) => `${y}px`);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed pointer-events-none z-10"
      style={{
        left: glowX,
        top: glowY,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}

// Noise texture overlay
function NoiseOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.015]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }}
    />
  );
}

export function HeroMotionBackground({ className = "" }: HeroMotionBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 50%, rgba(15, 23, 42, 1) 100%)"
            : "linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 50%, rgba(248, 250, 252, 1) 100%)",
        }}
      />

      {/* Mesh gradient layer */}
      <MeshGradient isDark={isDark} />

      {/* Gradient orbs layer */}
      <GradientOrbs isDark={isDark} />

      {/* Grid lines */}
      <GridLines isDark={isDark} />

      {/* Wave lines */}
      <WaveLines isDark={isDark} />

      {/* Floating particles */}
      <FloatingParticles isDark={isDark} />

      {/* Noise texture */}
      <NoiseOverlay />

      {/* Mouse follower glow - only on desktop */}
      <div className="hidden lg:block">
        <MouseGlow isDark={isDark} />
      </div>

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at center, transparent 0%, rgba(15, 23, 42, 0.4) 100%)"
            : "radial-gradient(ellipse at center, transparent 0%, rgba(248, 250, 252, 0.4) 100%)",
        }}
      />
    </div>
  );
}

export default HeroMotionBackground;
