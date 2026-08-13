import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const host = req.headers.get("host");
  if (host && host.includes("vercel.app")) {
    return new NextResponse("Website is only available on portal.codeopspro.com", { status: 404 });
  }

  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // Protect /admin routes — only ADMIN can access
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "ADMIN") {
      // Redirect to appropriate dashboard based on role
      const redirectUrl = getRoleDashboard(user.role as string);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
  }

  // Protect /candidate routes
  if (pathname.startsWith("/candidate") && pathname !== "/candidate/verify-request") {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "CANDIDATE") {
      const redirectUrl = getRoleDashboard(user.role as string);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
  }

  // Protect /learn/dashboard routes — only STUDENT can access
  if (pathname.startsWith("/learn/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "STUDENT" && user.role !== "ADMIN" && user.role !== "INSTRUCTOR") {
      return NextResponse.redirect(new URL("/candidate", req.url));
    }
  }

  // Protect /instructor routes — only INSTRUCTOR and ADMIN can access
  if (pathname.startsWith("/instructor")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      const redirectUrl = getRoleDashboard(user.role as string);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
  }

  return NextResponse.next();
});

function getRoleDashboard(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "CANDIDATE":
      return "/candidate";
    case "STUDENT":
      return "/learn/dashboard";
    case "INSTRUCTOR":
      return "/instructor";
    default:
      return "/";
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
