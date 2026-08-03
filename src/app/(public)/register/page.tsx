"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role: "STUDENT" }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      // Log in automatically after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      let targetUrl = "/learn/dashboard";

      if (rawCallbackUrl && rawCallbackUrl.startsWith(targetUrl)) {
        targetUrl = rawCallbackUrl;
      }

      router.push(targetUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="register-name" className="block text-sm font-medium text-surface-300 mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          id="register-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all outline-none"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-surface-300 mb-1.5">
          Email
        </label>
        <input
          type="email"
          id="register-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all outline-none"
          placeholder="student@example.com"
        />
      </div>

      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-surface-300 mb-1.5">
          Password
        </label>
        <input
          type="password"
          id="register-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-surface-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all outline-none"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 mt-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold hover:from-primary-400 hover:to-accent-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating account...
          </span>
        ) : (
          "Sign Up"
        )}
      </button>

      <div className="text-center mt-4">
        <span className="text-surface-400 text-sm">Already have an account? </span>
        <Link href="/login" className="text-primary-400 text-sm hover:text-primary-300 font-medium">
          Sign In
        </Link>
      </div>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="animate-scale-in relative w-full max-w-md my-8">
        <div className="glass-dark rounded-2xl p-8 sm:p-10 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center">
              <Image src="/logo.png" alt="CodeOps Pro Logo" width={64} height={64} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Create an Account</h1>
            <p className="text-surface-400 text-sm">
              Join CodeOps Pro Learning Hub
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            }
          >
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
