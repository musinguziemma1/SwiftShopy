"use client";

import { motion } from "framer-motion";
import { BarChart3, Package, ShoppingCart, Users } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated skeleton loader */}
        <div className="relative w-24 h-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="w-full h-full rounded-2xl border-4 border-primary/20 border-t-primary" />
          </motion.div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center"
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </div>
        
        <div className="text-center">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-lg font-semibold text-gradient mb-2"
          >
            Loading Dashboard
          </motion.p>
          <p className="text-sm text-muted-foreground">
            Preparing your data...
          </p>
        </div>
        
        {/* Skeleton cards */}
        <div className="grid grid-cols-4 gap-3 mt-8">
          {[Package, ShoppingCart, Users, BarChart3].map((Icon, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-16 h-16 glass rounded-xl flex items-center justify-center"
            >
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              >
                <Icon className="w-6 h-6 text-muted-foreground" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
