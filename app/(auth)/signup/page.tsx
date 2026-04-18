"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Check, AlertCircle, ShoppingBag, Sparkles, Gift } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Logo } from "@/components/ui/logo";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import bcrypt from "bcryptjs";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams?.get("ref") || "";
  
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referralApplied, setReferralApplied] = useState(false);
  
  const createUser = useMutation(api.users.create);
  const createReferral = useMutation(api.referrals.createReferral);
  const completeReferral = useMutation(api.referrals.completeReferral);
  const referrerSettings = useQuery(
    api.referrals.getReferralCodeByCode,
    referralCode ? { code: referralCode } : "skip"
  );

  useEffect(() => {
    if (referralCode && referrerSettings) {
      setReferralApplied(true);
    }
  }, [referralCode, referrerSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!form.name || !form.email) { setError("Name and email are required."); return; }
    setLoading(true);
    setError("");
    try {
      const passwordHash = await bcrypt.hash(form.password, 10);
      const userId = await createUser({
        name: form.name,
        email: form.email,
        passwordHash,
        role: "seller",
        phone: form.phone || undefined,
      });

      if (referralCode && referrerSettings && referrerSettings.userId) {
        try {
          const referralId = await createReferral({
            referrerUserId: referrerSettings.userId,
            referrerCode: referralCode,
            referredUserEmail: form.email,
          });
          await completeReferral({
            referralId,
            referredUserId: userId,
          });
        } catch (refErr) {
          console.error("Referral tracking error:", refErr);
        }
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left — Branding */}
        <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-primary flex flex-col justify-center p-8 lg:p-12 text-white overflow-hidden">
          <BackgroundPaths variant="hero" className="absolute inset-0 opacity-30" />
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <Logo className="mb-12" />
            
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Start Selling<br />
              <span className="text-white/80">in Minutes</span>
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-md">
              Create your free store and start accepting WhatsApp orders and mobile money payments today.
            </p>
            
            <div className="space-y-4">
              {[
                { icon: <ShoppingBag className="w-5 h-5" />, text: "Free forever plan available" },
                { icon: <Check className="w-5 h-5" />, text: "No credit card required" },
                { icon: <Zap className="w-5 h-5" />, text: "Store live in under 10 minutes" },
                { icon: <Sparkles className="w-5 h-5" />, text: "MTN MoMo payments built-in" },
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
        <div className="relative flex flex-col justify-center p-8 lg:p-12 bg-background overflow-y-auto">
          <BackgroundPaths variant="minimal" className="absolute inset-0 opacity-50" />
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }} 
            className="relative z-10 max-w-md w-full mx-auto"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Create your account</h2>
              <p className="text-muted-foreground">Join 5,000+ sellers growing their business</p>
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
              Sign up with Google
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or create manually</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {referralApplied && referralCode && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
                >
                  <Gift className="w-5 h-5 text-green-500 shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-green-600">Referral Code Applied: {referralCode}</span>
                    <p className="text-xs text-green-500/80">You'll help your referrer earn rewards!</p>
                  </div>
                </motion.div>
              )}
              
              {[
                { name: "name", label: "Full Name", type: "text", placeholder: "Sarah Nakato", icon: <User className="w-5 h-5" /> },
                { name: "email", label: "Email Address", type: "email", placeholder: "you@example.com", icon: <Mail className="w-5 h-5" /> },
                { name: "phone", label: "Phone Number", type: "tel", placeholder: "0700 000 000", icon: <Phone className="w-5 h-5" /> },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-2">{field.label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{field.icon}</span>
                    <input 
                      name={field.name} 
                      type={field.type} 
                      value={(form as Record<string, string>)[field.name]} 
                      onChange={handleChange} 
                      placeholder={field.placeholder} 
                      required 
                      className="w-full pl-12 pr-4 py-3.5 glass rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    value={form.password} 
                    onChange={handleChange} 
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
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    name="confirmPassword" 
                    type="password" 
                    value={form.confirmPassword} 
                    onChange={handleChange} 
                    placeholder="Repeat password" 
                    required 
                    className="w-full pl-12 pr-4 py-3.5 glass rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all mt-6 ${
                  loading 
                    ? "bg-muted cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-600 to-primary hover:scale-[1.02] hover:shadow-xl shadow-lg"
                } text-white`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
            <p className="mt-4 text-center text-xs text-muted-foreground/70">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
