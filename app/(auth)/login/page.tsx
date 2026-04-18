"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Mail, Lock, Eye, EyeOff, Zap, ArrowRight, AlertCircle, Shield, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Logo } from "@/components/ui/logo";

const DEMO_ACCOUNTS = [
  { label: "Seller Demo", email: "seller@swiftshopy.com", password: "seller123", color: "from-blue-500 to-indigo-500" },
  { label: "Admin Demo", email: "admin@swiftshopy.com", password: "admin123", color: "from-purple-500 to-pink-500" },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { 
        email: email.toLowerCase().trim(), 
        password, 
        redirect: false 
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Get the fresh session
      const session = await getSession();
      const role = (session?.user as { role?: string })?.role;
      
      console.log("Logged in with role:", role);

      if (callbackUrl && callbackUrl !== "/login") {
        router.push(callbackUrl);
      } else {
        const isAdmin = ["admin", "super_admin", "support", "analyst"].includes(role as string);
        router.push(isAdmin ? "/admin" : "/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left — Branding */}
        <div className="relative bg-gradient-to-br from-primary via-indigo-600 to-purple-700 flex flex-col justify-center p-8 lg:p-12 text-white overflow-hidden">
          <BackgroundPaths variant="hero" className="absolute inset-0 opacity-30" />
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <Logo className="mb-12" />
            
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Sell More.<br />
              <span className="text-white/80">Earn More.</span><br />
              Grow More.
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-md">
              Uganda&apos;s leading WhatsApp Commerce platform. Accept mobile money payments and manage your business from one place.
            </p>
            
            <div className="space-y-4">
              {[
                { icon: <Shield className="w-5 h-5" />, text: "Free to get started" },
                { icon: <Zap className="w-5 h-5" />, text: "MTN MoMo payments" },
                { icon: <ShoppingCart className="w-5 h-5" />, text: "WhatsApp order integration" },
                { icon: <Sparkles className="w-5 h-5" />, text: "Real-time analytics" },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/90"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl" />
        </div>

        {/* Right — Form */}
        <div className="relative flex flex-col justify-center p-8 lg:p-12 bg-background">
          <BackgroundPaths variant="minimal" className="absolute inset-0 opacity-50" />
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }} 
            className="relative z-10 max-w-md w-full mx-auto"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
              <p className="text-muted-foreground">Sign in to your SwiftShopy account</p>
            </div>

            {/* Demo accounts */}
            <div className="mb-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-2 gap-3">
                {DEMO_ACCOUNTS.map((acc, i) => (
                  <button 
                    key={i} 
                    onClick={() => fillDemo(acc.email, acc.password)} 
                    className={`p-3 rounded-xl bg-gradient-to-r ${acc.color} text-white text-sm font-medium hover:scale-105 transition-all shadow-lg hover:shadow-xl`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-border/50 hover:bg-accent/50 transition-all font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or sign in manually</span>
              <div className="flex-1 h-px bg-border" />
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
              
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
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
                <div className="flex justify-end mt-2">
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                  loading 
                    ? "bg-muted cursor-not-allowed" 
                    : "bg-gradient-to-r from-primary to-indigo-600 hover:scale-[1.02] hover:shadow-xl shadow-lg"
                } text-primary-foreground`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Sign up free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
