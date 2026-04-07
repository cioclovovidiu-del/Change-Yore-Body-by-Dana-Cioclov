import { NextResponse } from "next/server";
import { Resend } from "resend";
import { emailFrom, emailReplyTo, DANIELA_EMAIL, listUnsubscribeHeaders, emailLegalFooterHtml } from "@/lib/email-config";

// ── Phase 0: GDPR consent timestamp logging ─────────────────────────
// Emits structured log matching architecture's consent_records schema.
// Will be replaced by DB insert in Phase 1 when user/DB layer exists.
const CONSENT_TEXT_VERSION = "2026-04-07-v1";

function logConsentRecord(
  request: Request,
  consentType: "gdpr" | "marketing" | "terms",
  email: string,
  source: string
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  console.log(
    JSON.stringify({
      event: "CYB_CONSENT_RECORD",
      consentType,
      email: email || "unknown",
      consentedAt: new Date().toISOString(),
      ipAddress: ip,
      consentTextVersion: CONSENT_TEXT_VERSION,
      source,
    })
  );
}

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

interface QuestionMeta {
  id: string;
  title: string;
  block: string;
}

interface QuestionnairBody {
  answers: Record<string, string>;
  questions: QuestionMeta[];
}

interface MiniBody {
  type: "mini";
  profile: Record<string, unknown>;
}

interface CompletBody {
  type: "complet";
  profile: Record<string, unknown>;
  ans: Record<string, unknown>;
}

type RequestBody = QuestionnairBody | MiniBody | CompletBody;

// ── Labels for mini profile fields ──────────────────────────────────
const MINI_LABELS: Record<string, string> = {
  name: "Nume",
  age: "Vârstă",
  height: "Înălțime (cm)",
  weight: "Greutate (kg)",
  activity: "Nivel activitate",
  goal: "Obiectiv",
  moment: "Moment de viață",
  email: "Email",
  gdpr: "Consimțământ GDPR",
};

function buildEmailHtml(answers: Record<string, string>, questions: QuestionMeta[]): string {
  let currentBlock = "";
  let rows = "";

  for (const q of questions) {
    const value = answers[q.id];
    if (value === undefined) continue;

    if (q.block !== currentBlock) {
      currentBlock = q.block;
      rows += `<tr><td colspan="2" style="padding:14px 12px 6px;font-size:15px;font-weight:700;color:#c8a96e;border-bottom:2px solid #c8a96e;">${escapeHtml(currentBlock)}</td></tr>`;
    }

    rows += `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#999;vertical-align:top;width:45%;border-bottom:1px solid #2a2a2a;">${escapeHtml(q.title)}</td>
      <td style="padding:8px 12px;font-size:14px;color:#fff;border-bottom:1px solid #2a2a2a;">${escapeHtml(value)}</td>
    </tr>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f1923;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <h1 style="color:#c8a96e;font-size:22px;margin-bottom:4px;">Change Your Body</h1>
    <p style="color:#999;font-size:14px;margin-top:0;">Chestionar completat — ${new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      ${rows}
    </table>
  </div>
</body>
</html>`;
}

function buildMiniHtml(profile: Record<string, unknown>): string {
  let rows = "";
  for (const [key, value] of Object.entries(profile)) {
    if (value === undefined || value === null || value === "") continue;
    const label = escapeHtml(MINI_LABELS[key] || key);
    rows += `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#999;vertical-align:top;width:45%;border-bottom:1px solid #2a2a2a;">${label}</td>
      <td style="padding:8px 12px;font-size:14px;color:#fff;border-bottom:1px solid #2a2a2a;">${escapeHtml(String(value))}</td>
    </tr>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f1923;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <h1 style="color:#c8a96e;font-size:22px;margin-bottom:4px;">Change Your Body</h1>
    <p style="color:#999;font-size:14px;margin-top:0;">Mini chestionar — ${new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <tr><td colspan="2" style="padding:14px 12px 6px;font-size:15px;font-weight:700;color:#c8a96e;border-bottom:2px solid #c8a96e;">Profil Mini</td></tr>
      ${rows}
    </table>
  </div>
</body>
</html>`;
}

function buildCompletHtml(profile: Record<string, unknown>, ans: Record<string, unknown>): string {
  let rows = "";

  // Profile section
  rows += `<tr><td colspan="2" style="padding:14px 12px 6px;font-size:15px;font-weight:700;color:#c8a96e;border-bottom:2px solid #c8a96e;">Profil Mini</td></tr>`;
  for (const [key, value] of Object.entries(profile)) {
    if (value === undefined || value === null || value === "") continue;
    const label = escapeHtml(MINI_LABELS[key] || key);
    rows += `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#999;vertical-align:top;width:45%;border-bottom:1px solid #2a2a2a;">${label}</td>
      <td style="padding:8px 12px;font-size:14px;color:#fff;border-bottom:1px solid #2a2a2a;">${escapeHtml(String(value))}</td>
    </tr>`;
  }

  // Complet answers section
  rows += `<tr><td colspan="2" style="padding:14px 12px 6px;font-size:15px;font-weight:700;color:#c8a96e;border-bottom:2px solid #c8a96e;">Răspunsuri Complet</td></tr>`;
  for (const [key, value] of Object.entries(ans)) {
    if (value === undefined || value === null) continue;
    const display = Array.isArray(value) ? value.join(", ") : String(value);
    rows += `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#999;vertical-align:top;width:45%;border-bottom:1px solid #2a2a2a;">${escapeHtml(key)}</td>
      <td style="padding:8px 12px;font-size:14px;color:#fff;border-bottom:1px solid #2a2a2a;">${escapeHtml(display)}</td>
    </tr>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f1923;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <h1 style="color:#c8a96e;font-size:22px;margin-bottom:4px;">Change Your Body</h1>
    <p style="color:#999;font-size:14px;margin-top:0;">Chestionar complet — ${new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      ${rows}
    </table>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── D1: High-conversion user follow-up email after COMPLET completion ──
// Sent immediately at questionnaire completion. Uses real profile data
// (route from moment, goal) for dynamic personalization.
// Buyers will additionally receive C3 transactional emails from webhook.

const ROUTE_LABELS = ['Postpartum','Divorț/Separare','Schimbări hormonale','Burnout','Când pierzi pe cineva drag','General'];
const GOAL_NAMES = ['slăbire','tonifiere','energie','sănătate'];

const ROUTE_INSIGHTS: Record<string, string[]> = {
  'Burnout': [
    'Corpul tău dă semne clare de oboseală metabolică',
    'Nivelul de energie și recuperare este sub optim',
    'Ai nevoie de o strategie inteligentă, nu doar disciplină',
  ],
  'Schimbări hormonale': [
    'Semnale hormonale care îți blochează progresul',
    'Corpul tău nu reacționează la diete standard',
    'Ai nevoie de adaptare, nu restricție',
  ],
  'Postpartum': [
    'Corpul tău trece printr-o perioadă de reconstrucție',
    'Metabolismul se recalibrează — nu e vorba de voință',
    'Ai nevoie de un plan care respectă ritmul tău',
  ],
  'Divorț/Separare': [
    'Stresul emoțional îți afectează direct metabolismul',
    'Corpul tău are nevoie de stabilitate, nu de restricții',
    'O rutină structurată va face diferența reală acum',
  ],
  'Când pierzi pe cineva drag': [
    'Doliul afectează profund echilibrul hormonal și metabolic',
    'Corpul tău are nevoie de grijă, nu de presiune',
    'Un plan adaptat momentului tău este esențial',
  ],
};

// Goal-specific insights for weight_loss route
const GOAL_INSIGHTS: Record<string, string[]> = {
  'slăbire': [
    'Ai un potențial foarte bun de slăbire controlată',
    'Metabolismul tău răspunde bine la structură',
    'Consistența va face diferența',
  ],
  'tonifiere': [
    'Corpul tău este pregătit pentru tonifiere reală',
    'Combinația nutriție + antrenament targetat va face diferența',
    'Ai nevoie de un plan adaptat, nu de exerciții la întâmplare',
  ],
  'energie': [
    'Nivelul tău de energie poate crește semnificativ',
    'Alimentația corectă va schimba felul în care te simți zilnic',
    'Un plan structurat readuce echilibrul',
  ],
  'sănătate': [
    'Sănătatea ta merită o abordare personalizată',
    'Prevenția activă începe cu nutriția corectă',
    'Un plan adaptat ție face diferența pe termen lung',
  ],
};

function buildCompletFollowUpHtml(profile: Record<string, unknown>): string {
  const name = escapeHtml(String(profile.name || ""));
  const greeting = name ? `Dragă ${name},` : "Bună,";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://changeyourbody.ro";

  // Resolve route from moment index
  const momentIdx = typeof profile.moment === 'number' ? profile.moment : -1;
  const routeLabel = (momentIdx >= 0 && momentIdx < ROUTE_LABELS.length) ? ROUTE_LABELS[momentIdx] : null;

  // Resolve goal
  const goalIdx = typeof profile.goal === 'number' ? profile.goal : -1;
  const goalLabel = (goalIdx >= 0 && goalIdx < GOAL_NAMES.length) ? GOAL_NAMES[goalIdx] : null;

  // Pick insights: route-specific first, then goal-specific for General route, else none
  let insights: string[] | null = null;
  if (routeLabel && ROUTE_INSIGHTS[routeLabel]) {
    insights = ROUTE_INSIGHTS[routeLabel];
  } else if (routeLabel === 'General' && goalLabel && GOAL_INSIGHTS[goalLabel]) {
    insights = GOAL_INSIGHTS[goalLabel];
  }

  // Build subject-appropriate route label for display
  const routeDisplay = routeLabel && routeLabel !== 'General' ? routeLabel : null;

  // A. Micro-diagnostic block (only if insights available)
  const diagnosticBlock = insights ? `
      <div style="background:rgba(201,168,76,0.06);border-radius:10px;padding:16px 18px;border:1px solid rgba(201,168,76,0.15);margin-bottom:20px;">
        <p style="color:#C9A84C;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin:0 0 12px;">📋 Ce am observat la tine:</p>
        ${insights.map(i => `<p style="color:#e0e0e0;font-size:14px;line-height:1.7;margin:0 0 6px;padding-left:16px;position:relative;"><span style="position:absolute;left:0;color:#C9A84C;">•</span> ${escapeHtml(i)}</p>`).join('')}
      </div>` : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f1923;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#C9A84C;font-size:24px;margin:0 0 4px;">Change Your Body</h1>
      <p style="color:#666;font-size:13px;margin:0;">Profilul tău a fost analizat</p>
    </div>

    <div style="background:#141e29;border-radius:16px;padding:28px 24px;border:1px solid rgba(201,168,76,0.15);">
      <p style="color:#e0e0e0;font-size:15px;line-height:1.8;margin:0 0 8px;">${greeting}</p>

      <!-- B. Emotional reframe -->
      <p style="color:#ccc;font-size:14px;line-height:1.8;margin:0 0 8px;font-style:italic;">
        Nu este vorba despre voință.<br>
        Corpul tău are nevoie de direcția corectă.<br>
        Iar asta este exact ce urmează să primești.
      </p>

      <p style="color:#e0e0e0;font-size:15px;line-height:1.8;margin:0 0 20px;">
        Ai completat chestionarul Change Your Body — felicitări pentru acest prim pas!
        Răspunsurile tale au fost analizate și profilul tău este gata.${routeDisplay ? ` Traseul tău: <strong style="color:#C9A84C;">${escapeHtml(routeDisplay)}</strong>.` : ''}
      </p>

      <!-- A. Micro-diagnostic block (route/goal dependent) -->${diagnosticBlock}

      <div style="background:rgba(42,165,160,0.06);border-radius:10px;padding:16px;border:1px solid rgba(42,165,160,0.12);margin-bottom:20px;">
        <p style="color:#2AA5A0;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin:0 0 10px;">Ce urmează?</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#C9A84C;font-weight:700;font-size:15px;">1.</td><td style="padding:6px 0;color:#ccc;font-size:14px;line-height:1.6;">Alege pachetul potrivit pentru tine</td></tr>
          <tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#C9A84C;font-weight:700;font-size:15px;">2.</td><td style="padding:6px 0;color:#ccc;font-size:14px;line-height:1.6;">Daniela pregătește planul tău personalizat (24h)</td></tr>
          <tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#C9A84C;font-weight:700;font-size:15px;">3.</td><td style="padding:6px 0;color:#ccc;font-size:14px;line-height:1.6;">Începi transformarea cu nutriție + antrenament adaptat</td></tr>
        </table>
      </div>

      <!-- C. CTA upgrade -->
      <div style="text-align:center;margin-bottom:8px;">
        <a href="${escapeHtml(siteUrl)}/#mini-flow" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#2AA5A0,#1d8a86);color:#fff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;">Vezi exact ce plan ți se potrivește →</a>
      </div>
      <p style="text-align:center;color:#888;font-size:13px;margin:0 0 20px;">
        Planul tău este deja conturat. Tot ce mai rămâne este să începi.
      </p>

      <!-- D. WhatsApp smart link -->
      <div style="text-align:center;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="color:#999;font-size:13px;margin:0 0 12px;">Ai întrebări sau vrei ajutor să alegi? Scrie-i Danielei:</p>
        <a href="https://wa.me/40721333040?text=Salut%20Daniela,%20am%20completat%20chestionarul%20CYB%20%C8%99i%20vreau%20mai%20multe%20detalii" style="display:inline-block;padding:10px 24px;background:rgba(37,211,102,0.12);color:#25D366;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;border:1px solid rgba(37,211,102,0.2);">Scrie pe WhatsApp</a>
      </div>
    </div>

    ${emailLegalFooterHtml()}
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    if (!resend) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
    }

    let subject: string;
    let html: string;

    if ("type" in body && body.type === "mini") {
      // Landing-v2 mini payload: { type: 'mini', profile: {...} }
      const mini = body as MiniBody;
      if (!mini.profile) {
        return NextResponse.json({ error: "Missing profile" }, { status: 400 });
      }
      // B3: Server-side GDPR gate — reject if consent not given
      if (!mini.profile.gdpr) {
        return NextResponse.json({ error: "GDPR consent required" }, { status: 403 });
      }
      // Phase 0: GDPR consent timestamp log (audit trail)
      logConsentRecord(request, "gdpr", String(mini.profile.email || ""), "mini");
      const name = escapeHtml(String(mini.profile.name || "Anonim"));
      subject = `Mini CYB — ${name}`;
      html = buildMiniHtml(mini.profile);
    } else if ("type" in body && body.type === "complet") {
      // Landing-v2 complet payload: { type: 'complet', profile: {...}, ans: {...} }
      const complet = body as CompletBody;
      if (!complet.profile) {
        return NextResponse.json({ error: "Missing profile" }, { status: 400 });
      }
      // B3: Server-side GDPR gate — reject if consent not given
      if (!complet.profile.gdpr) {
        return NextResponse.json({ error: "GDPR consent required" }, { status: 403 });
      }
      // Phase 0: GDPR consent timestamp log (audit trail)
      logConsentRecord(request, "gdpr", String(complet.profile.email || ""), "complet");
      const name = escapeHtml(String(complet.profile.name || "Anonim"));
      subject = `Complet CYB — ${name}`;
      html = buildCompletHtml(complet.profile, complet.ans || {});
    } else {
      // Next.js questionnaire payload: { answers: {...}, questions: [...] }
      const q = body as QuestionnairBody;
      if (!q.answers || !q.questions) {
        return NextResponse.json({ error: "Missing answers or questions" }, { status: 400 });
      }
      const name = escapeHtml(q.answers.q1 || "Anonim");
      subject = `Chestionar CYB — ${name}`;
      html = buildEmailHtml(q.answers, q.questions);
    }

    // Send internal notification to Daniela (existing behavior, all types)
    const { error } = await resend.emails.send({
      from: emailFrom(),
      to: DANIELA_EMAIL,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // C9: User-facing follow-up email (COMPLET completion only)
    // Fires immediately — no delayed scheduler exists in this stack.
    // Safe: only sends if email present + GDPR consent already verified above.
    // Buyers will also get C3 transactional emails later — no conflict.
    let userEmailSent = false;
    if ("type" in body && body.type === "complet") {
      const complet = body as CompletBody;
      const userEmail = String(complet.profile.email || "").trim();
      if (userEmail && userEmail.includes("@")) {
        try {
          // E. Subject line: route-aware variant if moment available
          const mIdx = typeof complet.profile.moment === 'number' ? complet.profile.moment as number : -1;
          const rLabel = (mIdx >= 0 && mIdx < ROUTE_LABELS.length) ? ROUTE_LABELS[mIdx] : null;
          const userSubject = rLabel && rLabel !== 'General'
            ? `Rezultatul tău: ${rLabel} — vezi ce înseamnă pentru tine`
            : "Profilul tău este gata — și spune mai mult decât crezi";
          const { error: userErr } = await resend.emails.send({
            from: emailFrom(),
            replyTo: emailReplyTo,
            to: userEmail,
            subject: userSubject,
            html: buildCompletFollowUpHtml(complet.profile),
            headers: listUnsubscribeHeaders(),
          });
          if (userErr) {
            console.error("[C9] User follow-up email failed:", userErr);
          } else {
            userEmailSent = true;
            console.log(`[C9] Follow-up email sent to ${userEmail}`);
          }
        } catch (err) {
          console.error("[C9] User follow-up email exception:", err);
          // Non-fatal: Daniela notification already sent
        }
      }
    }

    return NextResponse.json({ ok: true, userFollowUp: userEmailSent });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
