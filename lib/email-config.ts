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

// ── Phase 0: Legal footer + unsubscribe for all customer emails ──────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://changeyourbody.ro";

/** Unsubscribe mailto address (used in List-Unsubscribe header + footer link) */
export const UNSUBSCRIBE_EMAIL = SENDER_ADDRESS;

/**
 * Build List-Unsubscribe header value for Resend emails.
 * Uses mailto: format which is universally supported by email clients.
 * Must be added as `headers` in every customer-facing resend.emails.send() call.
 */
export function listUnsubscribeHeaders(): Record<string, string> {
  return {
    "List-Unsubscribe": `<mailto:${UNSUBSCRIBE_EMAIL}?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

/**
 * Legal footer HTML for all customer-facing emails.
 * Includes: brand, legal links, unsubscribe, medical disclaimer.
 */
export function emailLegalFooterHtml(): string {
  return `
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
      <p style="color:#555;font-size:11px;line-height:1.6;margin:0 0 8px;">
        Change Your Body by Daniela Cioclov · changeyourbody.ro
      </p>
      <p style="color:#555;font-size:11px;line-height:1.6;margin:0 0 8px;">
        Programul are caracter informativ și nu înlocuiește sfatul medical.
      </p>
      <p style="color:#555;font-size:11px;line-height:1.6;margin:0;">
        <a href="${SITE_URL}/termeni" style="color:#666;text-decoration:underline;">Termeni și Condiții</a>
        &nbsp;·&nbsp;
        <a href="${SITE_URL}/confidentialitate" style="color:#666;text-decoration:underline;">Politica de Confidențialitate</a>
        &nbsp;·&nbsp;
        <a href="mailto:${UNSUBSCRIBE_EMAIL}?subject=unsubscribe" style="color:#666;text-decoration:underline;">Dezabonare</a>
      </p>
    </div>`;
}
