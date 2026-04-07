import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { Resend } from "resend";
import {
  emailFrom,
  emailReplyTo,
  emailLegalFooterHtml,
  listUnsubscribeHeaders,
} from "@/lib/email-config";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        console.error("[auth] Resend not configured — cannot send reset email");
        return;
      }
      const name = user.name || "";
      const greeting = name ? `Dragă ${name},` : "Bună,";

      await resend.emails.send({
        from: emailFrom(),
        replyTo: emailReplyTo,
        to: user.email,
        subject: "Resetare parolă — Change Your Body",
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f1923;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#C9A84C;font-size:24px;margin:0 0 4px;">Change Your Body</h1>
      <p style="color:#666;font-size:13px;margin:0;">Resetare parolă</p>
    </div>
    <div style="background:#141e29;border-radius:16px;padding:28px 24px;border:1px solid rgba(201,168,76,0.15);">
      <p style="color:#e0e0e0;font-size:15px;line-height:1.8;margin:0 0 16px;">${greeting}</p>
      <p style="color:#e0e0e0;font-size:15px;line-height:1.8;margin:0 0 20px;">
        Ai solicitat resetarea parolei pentru contul tău Change Your Body.
        Apasă pe butonul de mai jos pentru a seta o parolă nouă.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;background:#C9A84C;color:#0f1923;border-radius:10px;text-decoration:none;font-size:15px;font-weight:700;">Resetează parola →</a>
      </div>
      <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
        Linkul expiră în 1 oră. Dacă nu ai solicitat resetarea parolei, poți ignora acest email.
      </p>
    </div>
    ${emailLegalFooterHtml()}
  </div>
</body>
</html>`,
        headers: listUnsubscribeHeaders(),
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh after 1 day
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "client",
        input: false,
      },
      stripeCustomerId: {
        type: "string",
        required: false,
        input: false,
        fieldName: "stripeCustomerId",
      },
      lastLoginAt: {
        type: "date",
        required: false,
        input: false,
        fieldName: "lastLoginAt",
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
