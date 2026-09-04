import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

type FeedbackType = 'bug' | 'suggestion';

interface FeedbackMetadata {
  appVersion?: string;
  userAgent?: string;
  screen?: string;
  language?: string;
  url?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const buildHtml = (
  type: FeedbackType,
  message: string,
  userEmail: string | undefined,
  metadata: FeedbackMetadata,
) => {
  const isBug = type === 'bug';
  const badgeColor = isBug ? '#f87171' : '#22d3ee';
  const badgeLabel = isBug ? '🐛 BŁĄD' : '💡 SUGESTIA';
  const metaRows = Object.entries(metadata)
    .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#71717a;font-size:12px;">${escapeHtml(k)}</td><td style="padding:4px 0;color:#d4d4d8;font-size:12px;">${escapeHtml(String(v))}</td></tr>`,
    )
    .join('');

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#09090b;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#18181b;border:1px solid #27272a;border-radius:16px;padding:24px;">
    <div style="display:inline-block;border:1px solid ${badgeColor};color:${badgeColor};font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 10px;border-radius:999px;">${badgeLabel}</div>
    <h1 style="color:#fafafa;font-size:18px;margin:16px 0 8px;">CNC Kalkulator — nowe zgłoszenie</h1>
    <div style="white-space:pre-wrap;color:#e4e4e7;font-size:14px;line-height:1.6;background:#0f0f11;border:1px solid #27272a;border-radius:12px;padding:16px;margin:16px 0;">${escapeHtml(message)}</div>
    <p style="color:#a1a1aa;font-size:13px;margin:0 0 16px;">Kontakt: ${userEmail ? escapeHtml(userEmail) : '— (nie podano)'}</p>
    ${metaRows ? `<table style="width:100%;border-top:1px solid #27272a;padding-top:12px;">${metaRows}</table>` : ''}
  </div>
</body></html>`;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return json({ error: 'RESEND_API_KEY is not configured' }, 500);
    }

    const payload = (await req.json().catch(() => null)) as
      | { type?: unknown; message?: unknown; userEmail?: unknown; metadata?: unknown }
      | null;

    if (!payload) return json({ error: 'Invalid JSON body' }, 400);

    const type = payload.type === 'bug' || payload.type === 'suggestion' ? payload.type : null;
    if (!type) return json({ error: "Field 'type' must be 'bug' or 'suggestion'" }, 400);

    const message = typeof payload.message === 'string' ? payload.message.trim() : '';
    if (!message) return json({ error: "Field 'message' is required" }, 400);
    if (message.length > 5000) return json({ error: "Field 'message' is too long" }, 400);

    let userEmail: string | undefined;
    if (typeof payload.userEmail === 'string' && payload.userEmail.trim()) {
      const candidate = payload.userEmail.trim();
      if (candidate.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)) {
        return json({ error: "Field 'userEmail' is invalid" }, 400);
      }
      userEmail = candidate;
    }

    const rawMeta = (payload.metadata ?? {}) as Record<string, unknown>;
    const metadata: FeedbackMetadata = {};
    for (const key of ['appVersion', 'userAgent', 'screen', 'language', 'url'] as const) {
      const value = rawMeta[key];
      if (typeof value === 'string') metadata[key] = value.slice(0, 500);
    }

    const recipient = Deno.env.get('FEEDBACK_RECIPIENT_EMAIL') || 'onboarding@resend.dev';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CNC Kalkulator <onboarding@resend.dev>',
        to: [recipient],
        reply_to: userEmail,
        subject: `[CNC App] ${type === 'bug' ? '🐛 Zgłoszenie błędu' : '💡 Nowa sugestia'}`,
        html: buildHtml(type, message, userEmail, metadata),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('Resend error', res.status, data);
      return json({ error: 'Email provider rejected the request', details: data }, 502);
    }

    return json({ success: true, id: (data as { id?: string }).id ?? null }, 200);
  } catch (error) {
    console.error('send-feedback failed', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
