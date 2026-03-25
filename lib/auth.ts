import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const DEMO_USERS = [
  {
    id: "user_seller_1",
    name: "Sarah Nakato",
    email: "seller@swiftshopy.com",
    password: "seller123",
    role: "seller" as const,
    storeSlug: "nakato-styles",
  },
  {
    id: "user_admin_1",
    name: "Admin User",
    email: "admin@swiftshopy.com",
    password: "admin123",
    role: "admin" as const,
    storeSlug: null as null,
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);
          const user = DEMO_USERS.find(
            (u) => u.email === email && u.password === password
          );
          if (!user) return null;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            storeSlug: user.storeSlug ?? null,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.storeSlug = (user as any).storeSlug ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).storeSlug = token.storeSlug;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET ?? "swiftshopy-dev-secret-key-2024",
};

export default NextAuth(authOptions);
