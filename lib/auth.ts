import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const loginSchema = z.object({
  email: z.string().email().transform(e => e.toLowerCase().trim()),
  password: z.string().min(6),
});

// Environment validation
function validateEnvironment() {
  const required = ["NEXTAUTH_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  // Log configured providers
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log("✓ Google OAuth provider is configured");
  }

  if (process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.log("✓ Convex database is configured");
  }

  return missing.length === 0;
}

// Demo users - only available in development
const isDevelopment = process.env.NODE_ENV === "development";

const DEMO_USERS = isDevelopment
  ? [
      {
        id: "user_seller_1",
        name: "Sarah Nakato",
        email: "seller@swiftshopy.com",
        passwordHash: "$2a$10$8K1p/a0dR9lXyVQX4P0e0eQq6Q1Z1X1X1X1X1X1X1X1X1X1X1X1X1a",
        password: "seller123",
        role: "seller" as const,
        storeSlug: "nakato-styles",
      },
      {
        id: "user_admin_1",
        name: "Admin User",
        email: "admin@swiftshopy.com",
        passwordHash: "$2a$10$8K1p/a0dR9lXyVQX4P0e0eQq6Q1Z1X1X1X1X1X1X1X1X1X1X1X1X1b",
        password: "admin123",
        role: "admin" as const,
        storeSlug: null as null,
      },
      {
        id: "user_admin_2",
        name: "Musinguzi Emmanuel",
        email: "musinguzie612@gmail.com",
        passwordHash: "$2a$10$8K1p/a0dR9lXyVQX4P0e0eQq6Q1Z1X1X1X1X1X1X1X1X1X1X1X1X1b",
        password: "superadmin123",
        role: "super_admin" as const,
        storeSlug: null as null,
      },
    ]
  : [];

// Initialize validation
if (typeof window === "undefined") {
  validateEnvironment();
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Auth attempt for:", credentials?.email);

        // Validate required environment variables at runtime
        if (!process.env.NEXTAUTH_SECRET) {
          console.error("NEXTAUTH_SECRET is not configured");
          return null;
        }

        // Check if Convex is available in production
        if (!isDevelopment && !process.env.NEXT_PUBLIC_CONVEX_URL) {
          console.error("NEXT_PUBLIC_CONVEX_URL is not configured for production");
          return null;
        }

        try {
          const { email, password } = loginSchema.parse(credentials);

          // Check demo users first (for development)
          const demoUser = DEMO_USERS.find(u => u.email === email);
          if (demoUser) {
            if (demoUser.password === password) {
              console.log("Demo user login successful:", email);
              return {
                id: demoUser.id,
                name: demoUser.name,
                email: demoUser.email,
                role: demoUser.role,
                storeSlug: demoUser.storeSlug ?? null,
              };
            } else {
              console.warn("Demo user password mismatch for:", email);
            }
          }

          // Check Convex database
          try {
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            if (convexUrl) {
              const convex = new ConvexHttpClient(convexUrl);
              const user = await convex.query(api.users.getByEmail, { email });
              
              if (!user) {
                console.warn("No user found in Convex for:", email);
              } else if (!user.isActive) {
                console.warn("User account is inactive:", email);
              } else {
                const isValid = await bcrypt.compare(password, user.passwordHash);
                if (isValid) {
                  console.log("Convex user login successful:", email);
                  return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    storeSlug: null,
                  };
                } else {
                  console.warn("Invalid password for Convex user:", email);
                }
              }
            } else {
              console.error("NEXT_PUBLIC_CONVEX_URL is not set!");
            }
          } catch (convexError) {
            console.error("Convex auth client error:", convexError);
          }

          return null;
        } catch (err: any) {
          console.error("Authorize function exception:", err.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
          if (convexUrl) {
            const convex = new ConvexHttpClient(convexUrl);
            const email = user.email?.toLowerCase();
            
            // Check if user already exists
            let existingUser = await convex.query(api.users.getByEmail, { email: email! });
            
            if (!existingUser) {
              // Create user in Convex if they don't exist
              const newUserId = await convex.mutation(api.users.create, {
                name: user.name || "Google User",
                email: email!,
                passwordHash: "google_oauth_" + Date.now(),
                role: "seller",
                phone: "+256700000000",
              });
              
              // Create default store for new user
              const storeSlug = email!.split("@")[0].replace(/[^a-z0-9]/g, "-") + "-store";
              await convex.mutation(api.stores.create, {
                userId: newUserId,
                name: user.name || "My Store",
                slug: storeSlug,
                description: "Welcome to my store",
                phone: "+256700000000",
              });
              
              console.log("Created new user and store for Google user:", email);
            }
          }
        } catch (e) {
          console.error("Error creating user on Google sign in:", e);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.storeSlug = (user as any).storeSlug ?? null;
      }
      if (account?.provider === "google") {
        // Special handling for known Google users
        const googleUserEmail = token.email?.toLowerCase();
        
        // Map specific Google emails to roles
        const googleUserRoles: Record<string, { role: "seller" | "admin" | "super_admin"; storeSlug: string | null }> = {
          "musinguzie612@gmail.com": { role: "super_admin", storeSlug: null },
        };
        
        if (googleUserEmail && googleUserRoles[googleUserEmail]) {
          token.role = googleUserRoles[googleUserEmail].role as "seller" | "admin" | "super_admin";
          token.storeSlug = googleUserRoles[googleUserEmail].storeSlug;
        } else {
          // Check demo users only in development
          const demoUser = isDevelopment ? DEMO_USERS.find((u) => u.email === token.email) : undefined;
          token.role = (demoUser?.role ?? "seller") as "seller" | "admin" | "super_admin";
          token.storeSlug = demoUser?.storeSlug ?? null;
        }
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
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
