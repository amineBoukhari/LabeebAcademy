/**
 * POST /api/contact — Cloudflare Pages Function.
 * Env vars (Pages → Settings → Environment variables):
 *   RESEND_API_KEY   re_xxx
 *   CONTACT_TO       amineboukhari20@gmail.com
 *   CONTACT_FROM     Labeeb Academy <site@yourdomain.tld>   (verified Resend sender)
 */

const FIELDS = ['nom', 'email', 'telephone', 'entreprise', 'role', 'sujet', 'edition', 'note', 'source'];

export async function onRequestPost({ request, env }) {
  let data;
  const type = request.headers.get('content-type') || '';
  try {
    if (type.includes('application/json')) {
      data = await request.json();
    } else {
      const form = await request.formData();
      data = Object.fromEntries(form.entries());
    }
  } catch {
    return json({ ok: false, error: 'Requête illisible.' }, 400);
  }

  const clean = {};
  for (const k of FIELDS) clean[k] = String(data[k] ?? '').trim().slice(0, 4000);

  if (!clean.nom || !clean.email || !clean.telephone) {
    return json({ ok: false, error: 'Nom, email et numéro sont requis.' }, 422);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean.email)) {
    return json({ ok: false, error: 'Adresse email invalide.' }, 422);
  }
  if (String(data.captcha ?? '').trim() !== '') {
    return json({ ok: true }); // honeypot filled — silently accept
  }

  const subject = `[Labeeb] ${clean.sujet || clean.source || 'Demande'} — ${clean.nom}`;
  const lines = [
    `Nom        : ${clean.nom}`,
    `Email      : ${clean.email}`,
    `Numéro     : ${clean.telephone}`,
    `Entreprise : ${clean.entreprise || '—'}`,
    `Rôle       : ${clean.role || '—'}`,
    `Sujet      : ${clean.sujet || '—'}`,
    `Édition    : ${clean.edition || '—'}`,
    `Source     : ${clean.source || '—'}`,
    '',
    'Note :',
    clean.note || '—'
  ].join('\n');

  if (!env.RESEND_API_KEY) {
    console.log('[contact] RESEND_API_KEY missing, logging instead:\n' + lines);
    return json({ ok: true, delivered: false });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM || 'Labeeb Academy <onboarding@resend.dev>',
      to: [env.CONTACT_TO || 'amineboukhari20@gmail.com'],
      reply_to: clean.email,
      subject,
      text: lines
    })
  });

  if (!res.ok) {
    console.error('[contact] resend error', res.status, await res.text());
    return json({ ok: false, error: "L'envoi a échoué. Réessayez ou écrivez-nous directement." }, 502);
  }
  return json({ ok: true, delivered: true });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}
