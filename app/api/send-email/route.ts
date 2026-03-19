import { NextResponse } from "next/server";
import { Resend } from "resend";

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
      rows += `<tr><td colspan="2" style="padding:14px 12px 6px;font-size:15px;font-weight:700;color:#c8a96e;border-bottom:2px solid #c8a96e;">${currentBlock}</td></tr>`;
    }

    rows += `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#999;vertical-align:top;width:45%;border-bottom:1px solid #2a2a2a;">${q.title}</td>
      <td style="padding:8px 12px;font-size:14px;color:#fff;border-bottom:1px solid #2a2a2a;">${value}</td>
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
    const label = MINI_LABELS[key] || key;
    rows += `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#999;vertical-align:top;width:45%;border-bottom:1px solid #2a2a2a;">${label}</td>
      <td style="padding:8px 12px;font-size:14px;color:#fff;border-bottom:1px solid #2a2a2a;">${String(value)}</td>
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
    const label = MINI_LABELS[key] || key;
    rows += `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#999;vertical-align:top;width:45%;border-bottom:1px solid #2a2a2a;">${label}</td>
      <td style="padding:8px 12px;font-size:14px;color:#fff;border-bottom:1px solid #2a2a2a;">${String(value)}</td>
    </tr>`;
  }

  // Complet answers section
  rows += `<tr><td colspan="2" style="padding:14px 12px 6px;font-size:15px;font-weight:700;color:#c8a96e;border-bottom:2px solid #c8a96e;">Răspunsuri Complet</td></tr>`;
  for (const [key, value] of Object.entries(ans)) {
    if (value === undefined || value === null) continue;
    const display = Array.isArray(value) ? value.join(", ") : String(value);
    rows += `<tr>
      <td style="padding:8px 12px;font-size:13px;color:#999;vertical-align:top;width:45%;border-bottom:1px solid #2a2a2a;">${key}</td>
      <td style="padding:8px 12px;font-size:14px;color:#fff;border-bottom:1px solid #2a2a2a;">${display}</td>
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
      const name = escapeHtml(String(mini.profile.name || "Anonim"));
      subject = `Mini CYB — ${name}`;
      html = buildMiniHtml(mini.profile);
    } else if ("type" in body && body.type === "complet") {
      // Landing-v2 complet payload: { type: 'complet', profile: {...}, ans: {...} }
      const complet = body as CompletBody;
      if (!complet.profile) {
        return NextResponse.json({ error: "Missing profile" }, { status: 400 });
      }
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

    const { error } = await resend.emails.send({
      from: "CYB Chestionar <onboarding@resend.dev>",
      to: "cioclov.ovidiu@gmail.com",
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
