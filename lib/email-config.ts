// ── C10: Centralized email sender config ────────────────────────────
// Resolves sender address from env (custom verified domain) or falls
// back to Resend's shared onboarding address. Provides consistent
// reply-to so customer replies reach Daniela regardless of sender.
//
// Env vars (optional — set in Vercel when Resend domain is verified):
//   EMAIL_FROM       — verified sender, e.g. "noreply@changeyourbody.ro"
//   EMAIL_REPLY_TO   — reply address, default: cioclov.ovidiu@gmail.com
//
// Usage:
//   import { emailFrom, emailReplyTo, DANIELA_EMAIL } from "@/lib/email-config";
//   resend.emails.send({ from: emailFrom("Change Your Body"), replyTo: emailReplyTo, ... })

const FALLBACK_SENDER = "onboarding@resend.dev";

/** Daniela's inbox — internal notifications + reply-to target */
export const DANIELA_EMAIL = "cioclov.ovidiu@gmail.com";

/**
 * Resolved sender address from env or fallback.
 * Raw address only (no display name).
 */
export const senderAddress =
  process.env.EMAIL_FROM?.trim() || FALLBACK_SENDER;

/** Whether a custom verified domain is configured */
export const hasCustomSender = senderAddress !== FALLBACK_SENDER;

/**
 * Build a "Display Name <address>" from string.
 * Example: emailFrom("Change Your Body") → "Change Your Body <noreply@changeyourbody.ro>"
 */
export function emailFrom(displayName: string): string {
  return `${displayName} <${senderAddress}>`;
}

/** Reply-to address — ensures customer replies reach Daniela */
export const emailReplyTo =
  process.env.EMAIL_REPLY_TO?.trim() || DANIELA_EMAIL;
