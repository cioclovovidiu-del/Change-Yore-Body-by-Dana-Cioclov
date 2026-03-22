// ── C10: Centralized email sender config ────────────────────────────
// All outbound emails use verified domain: support@changeyourbody.ro
// Reply-to ensures customer replies reach Daniela.
//
// Usage:
//   import { emailFrom, emailReplyTo, DANIELA_EMAIL } from "@/lib/email-config";
//   resend.emails.send({ from: emailFrom(), replyTo: emailReplyTo, ... })

/** Verified sender address for all outbound emails */
const SENDER_ADDRESS = "support@changeyourbody.ro";

/** Daniela's inbox — internal notifications + reply-to target */
export const DANIELA_EMAIL = "cioclov.ovidiu@gmail.com";

/** Whether a custom verified domain is configured */
export const hasCustomSender = true;

/**
 * Build the full "from" header for all emails.
 * Always uses the verified domain sender.
 */
export function emailFrom(): string {
  return `Dana Cioclov - Change Your Body <${SENDER_ADDRESS}>`;
}

/** Reply-to address — ensures customer replies reach Daniela */
export const emailReplyTo =
  process.env.EMAIL_REPLY_TO?.trim() || DANIELA_EMAIL;
