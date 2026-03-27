"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass rounded-2xl p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-orange-500/10 rounded-2xl flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 text-orange-500" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Store Unavailable</h2>
        <p className="text-muted-foreground mb-8">
          This store is temporarily unavailable or doesn&apos;t exist. Please try again later.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 glass rounded-xl font-medium hover:bg-accent/50 transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
