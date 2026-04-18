"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import bcrypt from "bcryptjs";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const email = searchParams?.get("email") || "";
  const code = searchParams?.get("code") || "";
  
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  const verifyCode = useMutation(api.emailVerification.verifyCode);
  const setPassword = useMutation(api.setPassword.setPassword);

  // Verify code on mount
  useEffect(() => {
    const verify = async () => {
      if (!email || !code) {
        setError("Invalid reset link");
        return;
      }

      try {
        const result = await verifyCode({
          email: email.toLowerCase(),
          code,
          type: "password_reset",
        });

        if (result.success) {
          setCodeVerified(true);
        } else {
          setError(result.error || "Invalid or expired reset code");
        }
      } catch (err: any) {
        setError(err.message || "Failed to verify reset code");
      }
    };

    verify();
  }, [email, code, verifyCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const passwordHash = await bcrypt.hash(form.password, 10);

      await setPassword({
        email: email.toLowerCase(),
        passwordHash,
      });

      setSuccess(true);
      
      setTimeout(() => {
        router.push("/login?message=password_reset");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
          <p className="text-muted-foreground mb-6">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2">Password Reset Successfully!</h1>
          <p className="text-muted-foreground mb-4">Your password has been updated.</p>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left — Branding */}
        <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-primary flex flex-col justify-center p-8 lg:p-12 text-white overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">SwiftShopy</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Create New<br />
              <span className="text-white/80">Password</span>
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-md">
              Your identity has been verified. Please create a new secure password for your account.
            </p>

            <div className="space-y-4">
              {[
                { text: "At least 6 characters" },
                { text: "Mix of letters and numbers recommended" },
                { text: "Keep it secure and unique" },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/90"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl" />
        </div>

        {/* Right — Form */}
        <div className="relative flex flex-col justify-center p-8 lg:p-12 bg-background">
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }} 
            className="relative z-10 max-w-md w-full mx-auto"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Set New Password</h2>
              <p className="text-muted-foreground">For {email}</p>
            </div>

            {!codeVerified && !error && (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-muted-foreground">Verifying reset code...</span>
              </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <span className="text-sm text-red-500">{error}</span>
                  <Link href="/forgot-password" className="block text-xs text-red-400 hover:underline mt-1">
                    Request a new reset link
                  </Link>
                </div>
              </motion.div>
            )}

            {codeVerified && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 6 characters" 
                      required 
                      className="w-full pl-12 pr-12 py-3.5 glass rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="password" 
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repeat password" 
                      required 
                      className="w-full pl-12 pr-4 py-3.5 glass rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading} 
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                    loading 
                      ? "bg-muted cursor-not-allowed" 
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] hover:shadow-xl shadow-lg"
                  } text-white`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                      Updating...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            <Link 
              href="/login"
              className="inline-flex items-center gap-2 mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
