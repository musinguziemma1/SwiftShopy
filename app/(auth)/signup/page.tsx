"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Check, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    // Demo: redirect to login after "signup"
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/login?registered=true");
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {/* Left */}
      <div style={{ background: "linear-gradient(135deg, #6d28d9, #9333ea)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem", color: "#ffffff" }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "3rem" }}>
            <div style={{ width: "3rem", height: "3rem", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap className="w-6 h-6" style={{ color: "#ffffff" }} />
            </div>
            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>SwiftShopy</span>
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "1.5rem" }}>Start Selling<br />in Minutes</h1>
          <p style={{ fontSize: "1.125rem", opacity: 0.85, lineHeight: 1.7, marginBottom: "3rem" }}>
            Create your free store and start accepting WhatsApp orders and mobile money payments today.
          </p>
          {[
            { text: "Free forever plan available" },
            { text: "No credit card required" },
            { text: "Store live in under 10 minutes" },
            { text: "MTN MoMo payments built-in" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{ width: "1.25rem", height: "1.25rem", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check className="w-3 h-3" style={{ color: "#ffffff" }} />
              </div>
              <span style={{ fontSize: "0.875rem", opacity: 0.9 }}>{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem", backgroundColor: "#ffffff", overflowY: "auto" }}>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: "28rem", width: "100%", margin: "0 auto" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Create your account</h2>
            <p style={{ color: "#64748b" }}>Join 5,000+ sellers growing their business</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem", marginBottom: "1rem" }}>
              <AlertCircle className="w-4 h-4" style={{ color: "#ef4444", flexShrink: 0 }} />
              <span style={{ fontSize: "0.875rem", color: "#dc2626" }}>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { name: "name", label: "Full Name", type: "text", placeholder: "Sarah Nakato", icon: <User className="w-4 h-4" style={{ color: "#94a3b8" }} /> },
              { name: "email", label: "Email Address", type: "email", placeholder: "you@example.com", icon: <Mail className="w-4 h-4" style={{ color: "#94a3b8" }} /> },
              { name: "phone", label: "Phone Number", type: "tel", placeholder: "0700 000 000", icon: <Phone className="w-4 h-4" style={{ color: "#94a3b8" }} /> },
            ].map((field) => (
              <div key={field.name}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>{field.label}</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }}>{field.icon}</span>
                  <input name={field.name} type={field.type} value={(form as any)[field.name]} onChange={handleChange} placeholder={field.placeholder} required style={{ width: "100%", paddingLeft: "2.75rem", paddingRight: "1rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
            ))}

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#94a3b8" }} />
                <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Min 6 characters" required style={{ width: "100%", paddingLeft: "2.75rem", paddingRight: "2.75rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                  {showPassword ? <EyeOff className="w-4 h-4" style={{ color: "#94a3b8" }} /> : <Eye className="w-4 h-4" style={{ color: "#94a3b8" }} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#94a3b8" }} />
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required style={{ width: "100%", paddingLeft: "2.75rem", paddingRight: "1rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.875rem", backgroundColor: loading ? "#a78bfa" : "#9333ea", color: "#ffffff", border: "none", borderRadius: "0.5rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontSize: "0.875rem" }}>
              {loading ? (
                <><div style={{ width: "1rem", height: "1rem", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#ffffff", borderRadius: "9999px", animation: "spin 0.8s linear infinite" }} /> Creating account...</>
              ) : (
                <><span>Create Free Account</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#9333ea", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
          <p style={{ marginTop: "0.75rem", textAlign: "center", fontSize: "0.75rem", color: "#94a3b8" }}>
            By creating an account, you agree to our{" "}
            <a href="#" style={{ color: "#9333ea" }}>Terms of Service</a> and{" "}
            <a href="#" style={{ color: "#9333ea" }}>Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
