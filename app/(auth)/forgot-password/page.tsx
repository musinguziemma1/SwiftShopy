"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const generateCode = useMutation(api.emailVerification.generateCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Generate a reset code
      const result = await generateCode({
        email: email.toLowerCase(),
        type: "password_reset",
      });

      if (result.success) {
        // Create reset link
        const link = `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}&code=${result.code}`;
        setResetLink(link);

        // Send email via API
        const emailResponse = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.toLowerCase(),
            resetLink: link,
          }),
        });

        const emailResult = await emailResponse.json();
        setSuccess(true);
      } else {
        setError("Failed to generate reset code");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to <strong>{email}</strong>. 
              Click the link in the email to set a new password.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or
              </p>
              <button 
                onClick={() => { setSuccess(false); setEmail(""); }}
                className="text-primary font-medium hover:underline"
              >
                try again with a different email
              </button>
            </div>
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
            <Logo className="mb-12" />
            
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Forgot Your<br />
              <span className="text-white/80">Password?</span>
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-md">
              No worries! Enter your email and we'll send you a link to reset your password.
            </p>

            <div className="space-y-4">
              {[
                { text: "Secure password reset" },
                { text: "Link expires in 1 hour" },
                { text: "No data is compromised" },
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
              <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
              <p className="text-muted-foreground">Enter your email to receive a reset link</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm text-red-500">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" 
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
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

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
