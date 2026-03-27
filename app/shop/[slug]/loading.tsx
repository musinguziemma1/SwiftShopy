"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Star, Heart } from "lucide-react";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="glass border-b border-border/50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
            <div className="w-32 h-6 rounded bg-muted animate-pulse" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
      
      <div className="container mx-auto p-6">
        {/* Hero skeleton */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2">
              <div className="w-full h-64 rounded-xl bg-muted animate-pulse" />
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <div className="w-3/4 h-8 rounded bg-muted animate-pulse" />
              <div className="w-full h-4 rounded bg-muted animate-pulse" />
              <div className="w-2/3 h-4 rounded bg-muted animate-pulse" />
              <div className="w-1/3 h-10 rounded-xl bg-muted animate-pulse mt-6" />
            </div>
          </div>
        </div>
        
        {/* Products grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4"
            >
              <div className="w-full h-40 rounded-lg bg-muted animate-pulse mb-4" />
              <div className="w-3/4 h-4 rounded bg-muted animate-pulse mb-2" />
              <div className="w-1/2 h-4 rounded bg-muted animate-pulse mb-4" />
              <div className="flex gap-2">
                <div className="flex-1 h-10 rounded-lg bg-muted animate-pulse" />
                <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 glass rounded-full px-6 py-3 flex items-center gap-3"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full"
        />
        <span className="text-sm font-medium">Loading store...</span>
      </motion.div>
    </div>
  );
}
