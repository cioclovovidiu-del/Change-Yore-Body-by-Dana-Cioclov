import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

interface QuestionMeta {
  id: string;
  title: string;
  block: string;
}

interface RequestBody {
  answers: Record<string, string>;
  questions: QuestionMeta[];
}

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

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    if (!body.answers || !body.questions) {
      return NextResponse.json({ error: "Missing answers or questions" }, { status: 400 });
    }

    const name = body.answers.q1 || "Anonim";

    const { error } = await resend.emails.send({
      from: "CYB Chestionar <onboarding@resend.dev>",
      to: "cioclov.ovidiu@gmail.com",
      subject: `Chestionar CYB — ${name}`,
      html: buildEmailHtml(body.answers, body.questions),
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
