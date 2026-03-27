"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-20 h-20 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg glow-primary"
        >
          <Shield className="w-10 h-10 text-white" />
        </motion.div>
        
        <div className="text-center">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-lg font-semibold text-gradient mb-2"
          >
            Authenticating
          </motion.p>
          <p className="text-sm text-muted-foreground">
            Verifying your credentials...
          </p>
        </div>
        
        <motion.div
          animate={{ width: ["0%", "100%", "0%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-primary to-indigo-600 rounded-full max-w-[200px]"
        />
      </motion.div>
    </div>
  );
}
