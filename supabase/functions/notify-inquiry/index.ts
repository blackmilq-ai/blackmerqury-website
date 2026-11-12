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
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!supabaseUrl || !serviceKey || !resendKey) {
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
  readUrl.searchParams.set("select", "id,request_type,name,email,phone,preferred_date,placement,size,description,reference_url,notification_claimed_at,notification_sent_at");
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

  const recipient = item.request_type === "tattoo"
    ? "tattoo@blackmerqury.art"
    : item.request_type === "digital-art"
      ? "art@blackmerqury.art"
      : "motion@blackmerqury.art";
  const typeLabel = item.request_type === "digital-art" ? "Digital Art" : item.request_type === "motion-design" ? "Motion Design" : "Tattoo";
  const lines = [
    `New ${typeLabel} enquiry received via blackmerqury.art`,
    "",
    `Name: ${item.name}`,
    `Email: ${item.email}`,
    `Phone: ${item.phone || "—"}`,
    `Preferred date: ${item.preferred_date || "—"}`,
    `Placement: ${item.placement || "—"}`,
    `Approximate size: ${item.size || "—"}`,
    `Reference: ${item.reference_url || "—"}`,
    "",
    "Project description:",
    item.description,
    "",
    `Request ID: ${item.id}`
  ];
  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "BLACKMERQURY <inquiries@mail.blackmerqury.art>",
      to: [recipient],
      reply_to: item.email,
      subject: `New ${typeLabel} enquiry — ${item.name}`,
      text: lines.join("\n")
    })
  });

  if (!sent.ok) {
    await fetch(claimUrl, {
      method: "PATCH",
      headers: restHeaders,
      body: JSON.stringify({ notification_claimed_at: null })
    });
    return response({ error: "Email provider rejected the notification." }, 502, origin);
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
