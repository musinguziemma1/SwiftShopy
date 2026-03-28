import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function getAuthUser(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return null;
  return {
    id: token.id as string,
    email: token.email as string,
    name: token.name as string,
    role: token.role as string,
  };
}

export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return { error: "Unauthorized", status: 401, user: null };
  }
  return { error: null, status: 200, user };
}

export async function requireAdmin(req: NextRequest) {
  const result = await requireAuth(req);
  if (result.error) return result;
  if (result.user?.role !== "admin") {
    return { error: "Forbidden - Admin access required", status: 403, user: null };
  }
  return result;
}

export async function requireSeller(req: NextRequest) {
  const result = await requireAuth(req);
  if (result.error) return result;
  if (result.user?.role !== "seller" && result.user?.role !== "admin") {
    return { error: "Forbidden - Seller access required", status: 403, user: null };
  }
  return result;
}
