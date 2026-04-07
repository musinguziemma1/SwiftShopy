"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, CheckCircle, XCircle, Clock, ArrowRight, Shield, AlertTriangle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const invitation = useQuery(
    api.adminInvitations.getByToken,
    token ? { token } : "skip"
  );

  const acceptInvitation = useMutation(api.adminInvitations.acceptInvitation);

  const handleAccept = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/invite?token=${token}`);
      return;
    }

    if (!invitation || invitation.isExpired) {
      setError("This invitation is invalid or has expired.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userId = (session.user as any).id;
      const userName = session.user.name || session.user.email || "Unknown";
      
      const result = await acceptInvitation({
        token,
        userId: userId as any,
        userName,
      });

      if (result.success) {
        setSuccess(true);
        // Redirect to set password page for first-time setup
        setTimeout(() => {
          router.push(`/set-password?email=${encodeURIComponent(invitation.email)}&token=${token}`);
        }, 1500);
      } else {
        setError(result.error || "Failed to accept invitation");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      super_admin: { color: "bg-purple-500/10 text-purple-500 border-purple-500/20", label: "Super Admin" },
      admin: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Admin" },
      support: { color: "bg-green-500/10 text-green-500 border-green-500/20", label: "Support" },
      analyst: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", label: "Analyst" },
    };
    return badges[role] || badges.admin;
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
          <p className="text-muted-foreground mb-6">This invitation link is invalid.</p>
          <Link href="/" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (invitation === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invitation Not Found</h1>
          <p className="text-muted-foreground mb-6">This invitation link is invalid or has been removed.</p>
          <Link href="/" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (invitation.isExpired || invitation.status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invitation Expired</h1>
          <p className="text-muted-foreground mb-6">This invitation has expired. Please request a new one.</p>
          <Link href="/" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (invitation.status === "accepted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Already Accepted</h1>
          <p className="text-muted-foreground mb-6">This invitation has already been accepted.</p>
          <Link href="/admin" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (invitation.status === "cancelled") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invitation Cancelled</h1>
          <p className="text-muted-foreground mb-6">This invitation has been cancelled.</p>
          <Link href="/" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
            Go to Homepage
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
          <h1 className="text-3xl font-bold mb-2">Invitation Accepted!</h1>
          <p className="text-muted-foreground mb-4">Setting up your account...</p>
          <p className="text-sm text-muted-foreground">You'll be redirected to set your password.</p>
        </motion.div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(invitation.role);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Admin Invitation</h1>
            <p className="text-muted-foreground">You've been invited to join SwiftShopy as an admin</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{invitation.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Invited by</span>
                <span className="font-medium">{invitation.invitedByName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expires</span>
                <span className="font-medium">{new Date(invitation.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>

            {invitation.permissions.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {invitation.permissions.map((perm, i) => (
                    <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                      {perm.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm text-red-500">{error}</span>
              </div>
            )}

            {!session?.user ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Please sign in to accept this invitation
                </p>
                <Link
                  href={`/login?callbackUrl=/invite?token=${token}`}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  Sign In to Accept
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <button
                onClick={handleAccept}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-muted cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    Accept Invitation
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By accepting, you agree to SwiftShopy's Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}
