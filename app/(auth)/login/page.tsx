"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Mail, Lock, Eye, EyeOff, Zap, ArrowRight, AlertCircle } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Seller Demo", email: "seller@swiftshopy.com", password: "seller123", color: "#3b82f6" },
  { label: "Admin Demo", email: "admin@swiftshopy.com", password: "admin123", color: "#9333ea" },
];

export default function LoginPage() {
  const router = useRouter();
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
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        const role = session?.user?.role;
        router.push(role === "admin" ? "/admin" : "/dashboard");
      }
    } catch {
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
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {/* Left — Branding */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a, #3b82f6)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem", color: "#ffffff" }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "3rem" }}>
            <div style={{ width: "3rem", height: "3rem", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap className="w-6 h-6" style={{ color: "#ffffff" }} />
            </div>
            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>SwiftShopy</span>
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "1.5rem" }}>
            Sell More.<br />Earn More.<br />Grow More.
          </h1>
          <p style={{ fontSize: "1.125rem", opacity: 0.85, lineHeight: 1.7, marginBottom: "3rem" }}>
            Uganda&apos;s leading WhatsApp Commerce platform. Accept mobile money payments and manage your business from one place.
          </p>
          {[
            "Free to get started",
            "MTN MoMo payments",
            "WhatsApp order integration",
            "Real-time analytics",
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "0.75rem" }}>{item}</motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right — Form */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem", backgroundColor: "#ffffff" }}>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: "28rem", width: "100%", margin: "0 auto" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Welcome back</h2>
            <p style={{ color: "#64748b" }}>Sign in to your SwiftShopy account</p>
          </div>

          {/* Demo accounts */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quick Demo Access</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {DEMO_ACCOUNTS.map((acc, i) => (
                <button key={i} onClick={() => fillDemo(acc.email, acc.password)} style={{ padding: "0.625rem 1rem", border: `2px solid ${acc.color}20`, borderRadius: "0.5rem", backgroundColor: `${acc.color}08`, color: acc.color, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>or sign in manually</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem", marginBottom: "1rem" }}>
              <AlertCircle className="w-4 h-4" style={{ color: "#ef4444", flexShrink: 0 }} />
              <span style={{ fontSize: "0.875rem", color: "#dc2626" }}>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#94a3b8" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={{ width: "100%", paddingLeft: "2.75rem", paddingRight: "1rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#94a3b8" }} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: "100%", paddingLeft: "2.75rem", paddingRight: "2.75rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                  {showPassword ? <EyeOff className="w-4 h-4" style={{ color: "#94a3b8" }} /> : <Eye className="w-4 h-4" style={{ color: "#94a3b8" }} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.875rem", backgroundColor: loading ? "#93c5fd" : "#3b82f6", color: "#ffffff", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontSize: "0.875rem" }}>
              {loading ? (
                <><div style={{ width: "1rem", height: "1rem", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#ffffff", borderRadius: "9999px", animation: "spin 0.8s linear infinite" }} /> Signing in...</>
              ) : (
                <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#3b82f6", fontWeight: 600, textDecoration: "none" }}>Sign up free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
