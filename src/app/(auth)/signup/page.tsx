"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    fund: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            Request Access
          </h1>
          <p className="text-sm text-muted text-center mb-6">
            Create your client portal account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Joe Valentine"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="joe@example.com"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">
                Fund Name
              </label>
              <input
                type="text"
                value={form.fund}
                onChange={(e) => setForm({ ...form, fund: e.target.value })}
                placeholder="Fund name or RIA"
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
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Create a password"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent-blue text-white font-semibold text-sm hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-xs text-muted text-center mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent-blue hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
