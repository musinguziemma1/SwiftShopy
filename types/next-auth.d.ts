import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "seller" | "admin" | "super_admin";
      storeSlug: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "seller" | "admin" | "super_admin";
    storeSlug: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "seller" | "admin" | "super_admin";
    storeSlug: string | null;
  }
}