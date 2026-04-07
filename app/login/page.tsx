"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError("Email sau parola incorectă.");
        setLoading(false);
        return;
      }

      router.push(redirectTo);
    } catch {
      setError("A apărut o eroare. Te rugăm să încerci din nou.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="font-serif text-3xl font-bold mb-1"
            style={{ color: "#C9A84C" }}
          >
            Change Your Body
          </h1>
          <p className="text-sm text-gray-400">Intră în contul tău</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-7 border"
          style={{
            background: "#141e29",
            borderColor: "rgba(201,168,76,0.15)",
          }}
        >
          {error && (
            <div
              className="mb-4 text-sm rounded-lg p-3 text-center"
              style={{
                background: "rgba(220,38,38,0.1)",
                color: "#f87171",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              {error}
            </div>
          )}

          <label className="block mb-4">
            <span className="text-sm text-gray-300 mb-1 block">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none"
              style={{
                background: "#0f1923",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              placeholder="email@exemplu.ro"
            />
          </label>

          <label className="block mb-6">
            <span className="text-sm text-gray-300 mb-1 block">Parolă</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none"
              style={{
                background: "#0f1923",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 text-sm font-bold transition-opacity disabled:opacity-50"
            style={{ background: "#C9A84C", color: "#0f1923" }}
          >
            {loading ? "Se conectează..." : "Intră în cont"}
          </button>

          <div className="text-center mt-4">
            <a
              href="/reset-password"
              className="text-sm hover:underline"
              style={{ color: "#C9A84C" }}
            >
              Am uitat parola
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
