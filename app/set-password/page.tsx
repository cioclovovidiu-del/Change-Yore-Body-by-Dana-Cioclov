"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SetPasswordPage() {
  return (
    <Suspense>
      <SetPasswordContent />
    </Suspense>
  );
}

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1
            className="font-serif text-3xl font-bold mb-1"
            style={{ color: "#C9A84C" }}
          >
            Change Your Body
          </h1>
          <div
            className="mt-8 rounded-2xl p-7 border"
            style={{
              background: "#141e29",
              borderColor: "rgba(201,168,76,0.15)",
            }}
          >
            <p className="text-gray-300 text-sm">
              Link invalid. Te rugăm să folosești linkul din email.
            </p>
            <a
              href="/login"
              className="inline-block mt-4 text-sm hover:underline"
              style={{ color: "#C9A84C" }}
            >
              ← Mergi la autentificare
            </a>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Parola trebuie să aibă minim 8 caractere.");
      return;
    }

    if (password !== confirm) {
      setError("Parolele nu se potrivesc.");
      return;
    }

    setLoading(true);

    try {
      // Uses BetterAuth's resetPassword endpoint which creates the account
      // row if none exists (perfect for first-time password setup)
      const result = await authClient.resetPassword({
        newPassword: password,
        token: token!,
      });

      if (result.error) {
        setError(
          "Linkul a expirat sau este invalid. Te rugăm să contactezi suportul."
        );
        setLoading(false);
        return;
      }

      router.push("/login?setup=success");
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
          <p className="text-sm text-gray-400">Creează-ți parola</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-7 border"
          style={{
            background: "#141e29",
            borderColor: "rgba(201,168,76,0.15)",
          }}
        >
          <p className="text-gray-300 text-sm mb-5 leading-relaxed">
            Bine ai venit! Setează o parolă pentru contul tău Change Your Body.
          </p>

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
            <span className="text-sm text-gray-300 mb-1 block">Parolă</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none"
              style={{
                background: "#0f1923",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              placeholder="Minim 8 caractere"
            />
          </label>

          <label className="block mb-6">
            <span className="text-sm text-gray-300 mb-1 block">
              Confirmă parola
            </span>
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm text-white outline-none"
              style={{
                background: "#0f1923",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              placeholder="Repetă parola"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 text-sm font-bold transition-opacity disabled:opacity-50"
            style={{ background: "#C9A84C", color: "#0f1923" }}
          >
            {loading ? "Se salvează..." : "Activează contul"}
          </button>
        </form>
      </div>
    </div>
  );
}
