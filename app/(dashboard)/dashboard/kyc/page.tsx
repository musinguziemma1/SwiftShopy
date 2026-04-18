"use client";

import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  Shield, Upload, Camera, User, Phone, Briefcase, CreditCard,
  ArrowLeft, ArrowRight, Check, AlertCircle, Loader, FileText,
  Calendar, Building, Hash, CheckCircle, XCircle, Clock, ChevronRight,
  Zap, Eye,
} from "lucide-react";
import { useKYCData, useKYCMutations } from "@/lib/hooks/useKYCData";
import { useSellerData } from "@/lib/hooks/useSellerData";
import { VerifiedBadge, KYCTierBadge } from "@/components/ui/verified-badge";
import FaceVerification from "@/components/kyc/face-verification";

import type { Id } from "@/convex/_generated/dataModel";

const STEPS = [
  { id: 1, label: "Personal Info", icon: <User className="w-5 h-5" /> },
  { id: 2, label: "Identity Document", icon: <CreditCard className="w-5 h-5" /> },
  { id: 3, label: "Selfie Verification", icon: <Camera className="w-5 h-5" /> },
  { id: 4, label: "Review & Submit", icon: <Check className="w-5 h-5" /> },
];

export default function KYCVerificationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userEmail = (session?.user as any)?.email;
  const { store, userId } = useSellerData(userEmail);
  const { kyc, kycStatus, kycTier, kycMessage, isLoading } = useKYCData(userId ?? undefined);
  const { submitKYC } = useKYCMutations();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form data
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [idType, setIdType] = useState<"national_id" | "passport" | "drivers_license">("national_id");
  const [idNumber, setIdNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  // Face verification scores
  const [faceMatchScore, setFaceMatchScore] = useState<number | null>(null);
  const [livenessScore, setLivenessScore] = useState<number | null>(null);
  // Tier 3 (optional)
  const [businessRegNumber, setBusinessRegNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [proofOfOwnershipUrl, setProofOfOwnershipUrl] = useState("");

  const documentRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const proofRef = useRef<HTMLInputElement>(null);

  // Pre-fill from session/store
  React.useEffect(() => {
    if (session?.user?.name && !fullName) setFullName(session.user.name);
    if (store?.name && !businessName) setBusinessName(store.name);
    if (store?.phone && !phoneNumber) setPhoneNumber(store.phone);
  }, [session, store]);

  // Pre-fill from existing KYC (for resubmission)
  React.useEffect(() => {
    if (kyc && kycStatus === "rejected") {
      setFullName(kyc.fullName || "");
      setDateOfBirth(kyc.dateOfBirth || "");
      setIdType(kyc.idType || "national_id");
      setIdNumber(kyc.idNumber || "");
      setBusinessName(kyc.businessName || "");
      setPhoneNumber(kyc.phoneNumber || "");
    }
  }, [kyc, kycStatus]);

  // File to base64
  const handleFileUpload = (file: File, setter: (url: string) => void) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG, WebP, or PDF file");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.onerror = () => setError("Failed to read file");
    reader.readAsDataURL(file);
  };

  const canProceedStep1 = fullName && dateOfBirth && phoneNumber && businessName;
  const canProceedStep2 = idType && idNumber && documentUrl;
  const canProceedStep3 = selfieUrl;
  const canSubmit = canProceedStep1 && canProceedStep2 && canProceedStep3;

  const handleSubmit = async () => {
    if (!userId || !canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await submitKYC({
        userId: userId as Id<"users">,
        fullName,
        dateOfBirth,
        idType,
        idNumber,
        documentUrl,
        selfieUrl,
        businessName,
        phoneNumber,
        businessRegNumber: businessRegNumber || undefined,
        tinNumber: tinNumber || undefined,
        proofOfOwnershipUrl: proofOfOwnershipUrl || undefined,
        faceMatchScore: faceMatchScore ?? undefined,
        livenessScore: livenessScore ?? undefined,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Failed to submit KYC. Please try again.");
    }
    setSubmitting(false);
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading verification...</p>
        </div>
      </div>
    );
  }

  // Already verified
  if (kycStatus === "verified") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center p-10 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <VerifiedBadge size="lg" className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-3">Identity Verified</h1>
            <p className="text-muted-foreground mb-2">Your identity has been verified and your account is fully active.</p>
            <KYCTierBadge tier={kycTier as any} size="md" />
            <div className="mt-8 flex gap-3 justify-center">
              <Link href="/dashboard"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold hover:shadow-lg transition-all">
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Pending
  if (kycStatus === "pending" && !success) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center p-10 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/30">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-10 h-10 text-blue-500 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Verification In Progress</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your documents are being reviewed by our team. This usually takes 1-2 business days.
              You&apos;ll receive a notification when the review is complete.
            </p>
            {kyc && (
              <div className="text-left max-w-sm mx-auto p-4 rounded-xl bg-card border border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium">{new Date(kyc.submittedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{kyc.fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID Type</span>
                  <span className="font-medium capitalize">{kyc.idType.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tier</span>
                  <KYCTierBadge tier={kyc.tier as any} />
                </div>
              </div>
            )}
            <div className="mt-8">
              <Link href="/dashboard"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:shadow-lg transition-all">
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Success (just submitted)
  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center p-10 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-12 h-12 text-green-500" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-3">Verification Submitted!</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your identity documents have been submitted successfully. Our team will review them within 1-2 business days.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // KYC Form
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Identity Verification
              </h1>
              <p className="text-sm text-muted-foreground">Complete verification to start accepting payments</p>
            </div>
          </div>
          <Logo className="h-8 w-32" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Rejection Banner */}
        {kycStatus === "rejected" && kyc?.rejectionReason && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border-2 border-red-500/30 bg-red-500/10">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-red-600 dark:text-red-400">Previous Submission Rejected</p>
                <p className="text-sm text-muted-foreground mt-1">{kyc.rejectionReason}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    animate={{
                      scale: step === s.id ? 1.1 : 1,
                      backgroundColor: step > s.id ? "rgb(16, 185, 129)" : step === s.id ? "rgb(99, 102, 241)" : "rgb(226, 232, 240)",
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"
                  >
                    {step > s.id ? <Check className="w-5 h-5" /> : s.icon}
                  </motion.div>
                  <span className={`text-xs font-medium hidden sm:block ${step >= s.id ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${step > s.id ? "bg-emerald-500" : "bg-muted"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-600">
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Personal Info */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="p-6 rounded-2xl border border-border bg-card">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Personal & Business Information
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Please provide accurate information matching your ID document.</p>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Full Name (as on ID) *</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Nakato Sarah"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Date of Birth *</label>
                  <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Phone Number (must match MoMo) *</label>
                  <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 0772100001"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Business Name *</label>
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. Nakato Styles"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>

              {/* Enterprise fields (optional) */}
              <div className="mt-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4" /> Enterprise Verification (Optional)
                </h3>
                <p className="text-xs text-muted-foreground mb-4">For higher transaction limits and enterprise badges.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Business Registration Number</label>
                    <input type="text" value={businessRegNumber} onChange={e => setBusinessRegNumber(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Tax Identification Number (TIN)</label>
                    <input type="text" value={tinNumber} onChange={e => setTinNumber(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button onClick={() => { if (canProceedStep1) setStep(2); }}
                  disabled={!canProceedStep1}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: ID Document */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="p-6 rounded-2xl border border-border bg-card">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Identity Document
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Upload a clear photo of your government-issued ID.</p>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5">ID Type *</label>
                  <select value={idType} onChange={e => setIdType(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver&apos;s License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">ID Number *</label>
                  <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)}
                    placeholder="Enter your ID number"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>

              {/* Document Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Upload ID Document *</label>
                <input type="file" ref={documentRef} accept="image/*,.pdf" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], setDocumentUrl); }} />
                {documentUrl ? (
                  <div className="relative p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Document uploaded</p>
                        <p className="text-xs text-muted-foreground">Click to replace</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <button onClick={() => documentRef.current?.click()}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                ) : (
                  <button onClick={() => documentRef.current?.click()}
                    className="w-full p-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/30 transition-all flex flex-col items-center gap-3 cursor-pointer">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Click to upload ID document</p>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP, or PDF • Max 5MB</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Enterprise: Proof of Ownership */}
              {(businessRegNumber || tinNumber) && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Proof of Business Ownership (Optional)</label>
                  <input type="file" ref={proofRef} accept="image/*,.pdf" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], setProofOfOwnershipUrl); }} />
                  {proofOfOwnershipUrl ? (
                    <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 flex items-center gap-3 cursor-pointer"
                      onClick={() => proofRef.current?.click()}>
                      <FileText className="w-5 h-5 text-purple-500" />
                      <span className="text-sm">Business proof uploaded</span>
                      <CheckCircle className="w-4 h-4 text-purple-500 ml-auto" />
                    </div>
                  ) : (
                    <button onClick={() => proofRef.current?.click()}
                      className="w-full p-4 rounded-xl border border-dashed border-purple-500/30 hover:border-purple-500/50 transition-all flex items-center gap-3 cursor-pointer">
                      <Upload className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-muted-foreground">Upload bank statement or MoMo registration proof</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-foreground font-medium hover:bg-accent/80 transition-all">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => { if (canProceedStep2) setStep(3); }}
                  disabled={!canProceedStep2}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Selfie */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="p-6 rounded-2xl border border-border bg-card">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" /> Selfie Verification
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Take a clear selfie. We'll verify it matches your ID photo.</p>

              <div className="mb-6">
                <FaceVerification
                  onCapture={(url) => setSelfieUrl(url)}
                  onVerificationComplete={(match, liveness) => {
                    setFaceMatchScore(match);
                    setLivenessScore(liveness);
                  }}
                  idImageSrc={documentUrl}
                />
              </div>

              {faceMatchScore !== null && (
                <div className={`p-4 rounded-xl border mb-4 ${
                  faceMatchScore >= 0.6 
                    ? "bg-green-50 border-green-200" 
                    : "bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-center gap-3">
                    {faceMatchScore >= 0.6 ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        faceMatchScore >= 0.6 ? "text-green-700" : "text-red-700"
                      }`}>
                        {faceMatchScore >= 0.6 
                          ? "Face Match Verified" 
                          : "Face Match Warning - Score: " + (faceMatchScore * 100).toFixed(1) + "%"
                        }
                      </p>
                      {faceMatchScore < 0.6 && (
                        <p className="text-xs text-red-600 mt-1">
                          Your selfie doesn't match your ID photo. Please retake.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-foreground font-medium hover:bg-accent/80 transition-all">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => { if (canProceedStep3) setStep(4); }}
                  disabled={!canProceedStep3}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  Review & Submit <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="p-6 rounded-2xl border border-border bg-card">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" /> Review Your Information
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Please review all details before submitting.</p>

              <div className="space-y-4">
                {/* Personal Info */}
                <div className="p-4 rounded-xl bg-accent/30 border border-border">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Personal Information
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Full Name:</span> <span className="font-medium ml-1">{fullName}</span></div>
                    <div><span className="text-muted-foreground">DOB:</span> <span className="font-medium ml-1">{dateOfBirth}</span></div>
                    <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium ml-1">{phoneNumber}</span></div>
                    <div><span className="text-muted-foreground">Business:</span> <span className="font-medium ml-1">{businessName}</span></div>
                  </div>
                </div>

                {/* ID Info */}
                <div className="p-4 rounded-xl bg-accent/30 border border-border">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" /> Identity Document
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">ID Type:</span> <span className="font-medium ml-1 capitalize">{idType.replace("_", " ")}</span></div>
                    <div><span className="text-muted-foreground">ID Number:</span> <span className="font-medium ml-1 font-mono">{idNumber}</span></div>
                    <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-600 font-medium text-xs">Document uploaded</span></div>
                    <div className="flex items-center gap-2"><Camera className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-600 font-medium text-xs">Selfie uploaded</span></div>
                  </div>
                </div>

                {/* Enterprise */}
                {(businessRegNumber || tinNumber) && (
                  <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Building className="w-4 h-4 text-purple-500" /> Enterprise Verification
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      {businessRegNumber && <div><span className="text-muted-foreground">Reg No:</span> <span className="font-medium ml-1">{businessRegNumber}</span></div>}
                      {tinNumber && <div><span className="text-muted-foreground">TIN:</span> <span className="font-medium ml-1">{tinNumber}</span></div>}
                    </div>
                  </div>
                )}

                {/* Tier indicator */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-indigo-500/5 border border-primary/20 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Your verification tier:</p>
                  <KYCTierBadge tier={(businessRegNumber && tinNumber) ? "enterprise" : "verified"} size="md" />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-foreground font-medium hover:bg-accent/80 transition-all">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleSubmit}
                  disabled={submitting || !canSubmit}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? (
                    <><Loader className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Shield className="w-4 h-4" /> Submit Verification</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security notice */}
        <div className="mt-8 text-center text-xs text-muted-foreground space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> Your data is encrypted and stored securely
          </p>
          <p>Documents are only viewable by authorized administrators</p>
        </div>
      </div>
    </div>
  );
}
