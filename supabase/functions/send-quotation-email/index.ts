import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@4.0.1'

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const { name, email, phone, event, days, packageName, total } = await req.json()
  if (!name || !email || !packageName || !Number.isFinite(Number(total))) {
    return Response.json({ error: 'Missing or invalid quotation details' }, { status: 400 })
  }
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const studioEmail = Deno.env.get('STUDIO_NOTIFICATION_EMAIL')
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')
  if (!apiKey || !studioEmail || !fromEmail) {
    return Response.json({ error: 'Email service is not configured yet' }, { status: 503 })
  }
  const resend = new Resend(apiKey)
  const amount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(total))
  const html = `<div style="font-family:Arial,sans-serif;color:#24211e;max-width:600px;margin:auto"><h2>ATELIER PHOTOGRAPHY</h2><p>Thank you, ${escapeHtml(name)}. Your quotation request has been received.</p><p><b>Collection:</b> ${escapeHtml(packageName)}<br><b>Event:</b> ${escapeHtml(event || 'Not specified')}<br><b>Event days:</b> ${Number(days) || 1}<br><b>Estimated total:</b> ${amount}</p><p>Our studio will contact you to confirm availability and finalize the scope.</p></div>`
  const safeName = escapeHtml(name)
  const [customer, studio] = await Promise.all([
    resend.emails.send({ from: fromEmail, to: email, subject: 'Your Atelier photography quotation request', html }),
    resend.emails.send({ from: fromEmail, to: studioEmail, replyTo: email, subject: `New quotation request — ${safeName}`, html: `<div style="font-family:Arial,sans-serif"><h2>New quotation request</h2><p>${html}</p><p>Phone: ${escapeHtml(phone || 'Not provided')}</p></div>` }),
  ])
  if (customer.error || studio.error) return Response.json({ error: 'Email delivery failed', details: customer.error || studio.error }, { status: 502 })
  return Response.json({ success: true })
})
function escapeHtml(value: unknown) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c)) }
