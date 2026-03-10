"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // For now, just redirect to dashboard (Supabase auth will be wired up later)
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent-blue flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight">
            CCM Capital
          </span>
        </div>

        <div className="ios-card p-8">
          <h1 className="text-[28px] md:text-[34px] font-bold text-foreground text-center mb-1 tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted text-center mb-6">
            Sign in to your client portal
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joe@ccmcapital.com"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent-blue text-white font-semibold text-sm hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-muted text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-accent-blue hover:underline"
            >
              Request access
            </Link>
          </p>
        </div>

        <p className="text-xs text-muted/50 text-center mt-6">
          CCM Capital &middot; Confidential Client Portal
        </p>
      </div>
    </div>
  );
}
