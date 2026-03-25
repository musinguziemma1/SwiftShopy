"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && role !== "admin") router.replace("/dashboard");
  }, [status, role, router]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "2.5rem", height: "2.5rem", border: "4px solid #9333ea", borderTopColor: "transparent", borderRadius: "9999px", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!session || role !== "admin") return null;
  return <>{children}</>;
}
