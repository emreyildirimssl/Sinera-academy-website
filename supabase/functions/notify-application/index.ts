// notify-application: e-mails iletisim@ about new Kurucu Firma Programı applications.
// Called by a database trigger after insert. Takes no input: it sends one e-mail per
// application that has not been notified yet, so calling it twice is harmless.
// The e-mail carries no personal data (no name, e-mail or phone); details stay in Supabase.
import { createClient } from "jsr:@supabase/supabase-js@2";

const TO = Deno.env.get("NOTIFY_TO") ?? "iletisim@sinerasaleslab.academy";
const FROM = Deno.env.get("NOTIFY_FROM") ?? "Sinera Academy <bildirim@bildirim.sinerasaleslab.academy>";

const esc = (s: string) => s.replace(/[<>&"]/g, "");

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return new Response("no RESEND_API_KEY", { status: 503 });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const { data: rows, error } = await db
    .from("site_applications")
    .select("id, created_at, company, team_size, sector, followup_consent")
    .is("notified_at", null)
    .order("created_at")
    .limit(20);
  if (error) return new Response(error.message, { status: 500 });

  let sent = 0;
  for (const r of rows ?? []) {
    // claim the row first so parallel calls never send twice
    const { data: claimed } = await db
      .from("site_applications")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", r.id)
      .is("notified_at", null)
      .select("id");
    if (!claimed?.length) continue;
    const when = new Date(r.created_at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
    const subject = `Yeni başvuru: ${r.company} · ${r.team_size}`;
    const text =
      `Kurucu Firma Programı'na yeni bir başvuru geldi.\n\n` +
      `Şirket: ${r.company}\nEkip büyüklüğü: ${r.team_size}\nSektör: ${r.sector}\n` +
      `Ocak iletişim onayı: ${r.followup_consent ? "Evet" : "Hayır"}\nZaman: ${when}\n\n` +
      `Ad, e-posta ve telefon bu e-postada yer almaz. Ayrıntılar: Supabase > SSYE > Table Editor > site_applications.`;
    const html =
      `<p>Kurucu Firma Programı'na yeni bir başvuru geldi.</p>` +
      `<table cellpadding="4" style="font-family:sans-serif;font-size:14px">` +
      `<tr><td><b>Şirket</b></td><td>${esc(r.company)}</td></tr>` +
      `<tr><td><b>Ekip büyüklüğü</b></td><td>${esc(r.team_size)}</td></tr>` +
      `<tr><td><b>Sektör</b></td><td>${esc(r.sector)}</td></tr>` +
      `<tr><td><b>Ocak iletişim onayı</b></td><td>${r.followup_consent ? "Evet" : "Hayır"}</td></tr>` +
      `<tr><td><b>Zaman</b></td><td>${when}</td></tr></table>` +
      `<p style="color:#666;font-size:13px">Ad, e-posta ve telefon bu e-postada yer almaz. Ayrıntılar: Supabase &gt; SSYE &gt; Table Editor &gt; site_applications.</p>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [TO], subject, text, html }),
    });
    if (res.ok) sent++;
    else {
      console.error("resend", res.status, await res.text().catch(() => ""));
      await db.from("site_applications").update({ notified_at: null }).eq("id", r.id);
    }
  }
  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } });
});
