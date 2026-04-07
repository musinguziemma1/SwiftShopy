import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If trying to access admin routes
    if (path.startsWith("/admin")) {
      const isAdmin = ["admin", "super_admin", "support", "analyst"].includes(token?.role as string);
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // If trying to access seller dashboard
    if (path.startsWith("/dashboard")) {
      const isSeller = (token?.role === "seller");
      const isAdmin = ["admin", "super_admin", "support", "analyst"].includes(token?.role as string);
      
      if (!isSeller && !isAdmin) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
