"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // If token is present, show the new password form
  if (token) {
    return <SetNewPassword token={token} />;
  }

  // Otherwise, show the request form
  return <RequestReset />;
}

function RequestReset() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
    } catch {
      // Always show success to prevent email enumeration
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
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
            <p className="text-gray-300 text-sm leading-relaxed">
              Dacă adresa <strong className="text-white">{email}</strong>{" "}
              există în sistemul nostru, vei primi un email cu instrucțiuni
              pentru resetarea parolei.
            </p>
            <a
              href="/login"
              className="inline-block mt-6 text-sm hover:underline"
              style={{ color: "#C9A84C" }}
            >
              ← Înapoi la autentificare
            </a>
          </div>
        </div>
      </div>
    );
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
          <p className="text-sm text-gray-400">Resetare parolă</p>
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
            Introdu adresa de email asociată contului tău. Vei primi un link
            pentru resetarea parolei.
          </p>

          <label className="block mb-6">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 text-sm font-bold transition-opacity disabled:opacity-50"
            style={{ background: "#C9A84C", color: "#0f1923" }}
          >
            {loading ? "Se trimite..." : "Trimite link de resetare"}
          </button>

          <div className="text-center mt-4">
            <a
              href="/login"
              className="text-sm hover:underline"
              style={{ color: "#C9A84C" }}
            >
              ← Înapoi la autentificare
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

function SetNewPassword({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setError(
          "Linkul a expirat sau este invalid. Te rugăm să soliciți un nou link."
        );
        setLoading(false);
        return;
      }

      router.push("/login?reset=success");
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
          <p className="text-sm text-gray-400">Setează parola nouă</p>
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
            <span className="text-sm text-gray-300 mb-1 block">
              Parolă nouă
            </span>
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
            {loading ? "Se salvează..." : "Salvează parola"}
          </button>
        </form>
      </div>
    </div>
  );
}
