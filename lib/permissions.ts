"use client";
import { useMemo } from "react";
import { useSession } from "next-auth/react";

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ["*"],
  admin: [
    "users:read", "users:write", "sellers:read", "sellers:write", "sellers:suspend",
    "transactions:read", "transactions:refund", "products:read", "products:approve",
    "orders:read", "orders:write", "reports:read", "reports:export",
    "support:read", "support:write", "support:manage", "audit:read",
    "bulk:execute", "reports:schedule", "settings:read", "settings:write"
  ],
  support: [
    "sellers:read", "orders:read", "support:read", "support:write", "reports:read"
  ],
  analyst: [
    "sellers:read", "transactions:read", "orders:read", "products:read",
    "reports:read", "reports:export", "audit:read"
  ],
};

export function usePermissions() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? "seller";

  const permissions = useMemo(() => {
    if (role === "admin") return ROLE_PERMISSIONS.super_admin;
    return ROLE_PERMISSIONS[role] ?? [];
  }, [role]);

  const hasPermission = (permission: string) => {
    if (permissions.includes("*")) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: string[]) => perms.some(p => hasPermission(p));

  return { permissions, hasPermission, hasAnyPermission, role };
}
