"use client";

import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

export default function AuthForm({ mode = "signin" }) {
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = isSignup
        ? await api.signUp({ name, email, password })
        : await api.signIn({ email, password });
      window.location.href = "/";
      return result;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-ink">
      <div className="w-full max-w-md rounded-2xl bg-paper text-ink shadow-2xl overflow-hidden">
        <div className="px-7 py-7 border-b border-ink/10">
          <Link href="/" className="text-xs font-mono uppercase tracking-[0.3em] text-velvet">Box Office</Link>
          <h1 className="font-display text-4xl mt-3">{isSignup ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-sm text-ink/55 mt-2">
            {isSignup ? "Create an account to reserve your event seats." : "Sign in to continue booking your seats."}
          </p>
        </div>

        <form onSubmit={submit} className="p-7 space-y-5">
          {isSignup && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} className="auth-input" placeholder="Yash Sharma" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="auth-input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="auth-input" placeholder="At least 6 characters" />
          </div>

          {error && <p className="rounded-lg bg-danger-soft text-danger px-3 py-2 text-sm">{error}</p>}

          <button disabled={loading} className="w-full rounded-lg bg-velvet text-paper font-semibold py-3 disabled:opacity-50">
            {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
          </button>

          <p className="text-center text-sm text-ink/55">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <Link href={isSignup ? "/signin" : "/signup"} className="font-semibold text-velvet hover:underline">
              {isSignup ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
