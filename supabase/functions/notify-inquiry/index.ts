const allowedOrigins = new Set([
  "https://blackmerqury.art",
  "https://www.blackmerqury.art",
  "http://localhost:3000"
]);

function response(body: Record<string, unknown>, status: number, origin: string | null) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
  });
  if (origin && allowedOrigins.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return response({}, 204, origin);
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405, origin);
  if (!origin || !allowedOrigins.has(origin)) return response({ error: "Origin not allowed" }, 403, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const scriptUrl = "https://script.google.com/macros/s/AKfycbxsUejXFOlRyeYSSWIFvh7ztzC63rPEhWd4AmaNOsCX9Rz_kozUa9wfzRSydPyGwP0/exec";
  const scriptSecret = Deno.env.get("GOOGLE_APPS_SCRIPT_SECRET");
  if (!supabaseUrl || !serviceKey || !scriptSecret) {
    return response({ error: "Email notification service is not configured." }, 503, origin);
  }

  let requestId = "";
  try {
    const body = await req.json();
    requestId = typeof body?.request_id === "string" ? body.request_id : "";
  } catch {
    return response({ error: "Invalid request body." }, 400, origin);
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return response({ error: "Invalid request identifier." }, 400, origin);
  }

  const restHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation"
  };
  const base = `${supabaseUrl}/rest/v1/contact_requests`;
  const readUrl = new URL(base);
  readUrl.searchParams.set("id", `eq.${requestId}`);
  readUrl.searchParams.set("select", "id,request_type,notification_claimed_at,notification_sent_at");
  const read = await fetch(readUrl, { headers: restHeaders });
  if (!read.ok) return response({ error: "Could not read enquiry." }, 502, origin);
  const rows = await read.json();
  const item = rows[0];
  if (!item) return response({ error: "Enquiry not found." }, 404, origin);
  if (item.notification_sent_at) return response({ ok: true, already_sent: true }, 200, origin);

  const now = new Date();
  const staleClaim = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  const claimUrl = new URL(base);
  claimUrl.searchParams.set("id", `eq.${requestId}`);
  claimUrl.searchParams.set("notification_sent_at", "is.null");
  claimUrl.searchParams.set("or", `(notification_claimed_at.is.null,notification_claimed_at.lt.${staleClaim})`);
  const claim = await fetch(claimUrl, {
    method: "PATCH",
    headers: restHeaders,
    body: JSON.stringify({ notification_claimed_at: now.toISOString() })
  });
  if (!claim.ok) return response({ error: "Could not claim enquiry notification." }, 502, origin);
  const claimedRows = await claim.json();
  if (!claimedRows.length) return response({ ok: true, already_claimed: true }, 200, origin);

  const recipient = "hello@blackmerqury.art";
  const typeLabel = item.request_type === "digital-art" ? "Digital Art" : item.request_type === "motion-design" ? "Motion Design" : "Tattoo";
  const subject = `New ${typeLabel} enquiry — BLACKMERQURY`;
  const textBody = [
    `A new ${typeLabel.toLowerCase()} enquiry has been submitted on blackmerqury.art.`,
    "",
    "Sign in to Backstage to review the request:",
    "https://blackmerqury.art/admin.html",
    "",
    `Internal request ID: ${item.id}`
  ].join("\n");
  const htmlBody = `<p>A new ${typeLabel.toLowerCase()} enquiry has been submitted on blackmerqury.art.</p><p><a href="https://blackmerqury.art/admin.html">Sign in to Backstage to review the request</a>.</p><p>Internal request ID: ${item.id}</p>`;

  const sent = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    body: JSON.stringify({
      to: recipient,
      subject,
      text: textBody,
      html: htmlBody,
      booking_code: item.id,
      secret: scriptSecret
    })
  });

  let result: Record<string, unknown> = {};
  try { result = await sent.json() } catch { /* handled below */ }
  if (!sent.ok || result.ok !== true) {
    const resetUrl = new URL(base);
    resetUrl.searchParams.set("id", `eq.${requestId}`);
    resetUrl.searchParams.set("notification_sent_at", "is.null");
    await fetch(resetUrl, {
      method: "PATCH",
      headers: restHeaders,
      body: JSON.stringify({ notification_claimed_at: null })
    });
    return response({ error: "Google Apps Script did not confirm the email notification." }, 502, origin);
  }

  const sentUrl = new URL(base);
  sentUrl.searchParams.set("id", `eq.${requestId}`);
  const update = await fetch(sentUrl, {
    method: "PATCH",
    headers: restHeaders,
    body: JSON.stringify({ notification_sent_at: new Date().toISOString() })
  });
  if (!update.ok) return response({ error: "Notification sent but status update failed." }, 502, origin);
  return response({ ok: true }, 200, origin);
});
