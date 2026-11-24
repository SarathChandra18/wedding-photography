import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@4.0.1'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) return json({ error: 'Authentication required' }, 401)
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: 'Bearer ' + token } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    if (userError || !userData.user) return json({ error: 'Invalid session' }, 401)
    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', userData.user.id).single()
    if (profileError || profile?.role !== 'admin') return json({ error: 'Administrator access required' }, 403)

    const { name, email, phone, event, days, total, reference, quote, pdfBase64 } = await req.json()
    if (!name || !email || !reference || !quote || !pdfBase64 || !Number.isFinite(Number(total))) return json({ error: 'Missing customer, quotation or PDF details' }, 400)
    if (String(pdfBase64).length > 8_000_000) return json({ error: 'PDF attachment is too large' }, 413)
    const apiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')
    const studioEmail = Deno.env.get('STUDIO_NOTIFICATION_EMAIL')
    if (!apiKey || !fromEmail || !studioEmail) return json({ error: 'Email service is not configured. Set RESEND_API_KEY, RESEND_FROM_EMAIL and STUDIO_NOTIFICATION_EMAIL.' }, 503)

    const resend = new Resend(apiKey)
    const amount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(total))
    const safeName = escapeHtml(name)
    const safeEvent = escapeHtml(event || 'Celebration')
    const safeReference = escapeHtml(reference)
    const html = '<div style="font-family:Georgia,serif;color:#29251f;max-width:620px;margin:0 auto;border:1px solid #b99b6b;padding:32px"><div style="font-size:24px;letter-spacing:3px">ATELIER</div><div style="font:11px Arial,sans-serif;letter-spacing:5px;color:#9a805a">PHOTOGRAPHY</div><hr style="border:0;border-top:1px solid #c9b58f;margin:22px 0"><p>Dear '+safeName+',</p><p>Thank you for considering Atelier Photography. Please find your personalized quotation attached as a PDF.</p><p><b>Quotation reference:</b> '+safeReference+'<br><b>Celebration:</b> '+safeEvent+'<br><b>Coverage:</b> '+(Number(days)||1)+' day(s)<br><b>Estimated total:</b> '+amount+'</p><p>We would be delighted to preserve these moments for you. Please reply to this email if you would like to discuss any detail.</p><p>Warm regards,<br><b>Atelier Photography</b><br>Hyderabad, India</p></div>'
    const attachment = { filename: reference + '.pdf', content: pdfBase64, contentType: 'application/pdf' }
    const [customerResult, studioResult] = await Promise.all([
      resend.emails.send({ from: fromEmail, to: email, replyTo: studioEmail, subject: 'Your Atelier Photography quotation · ' + reference, html, attachments: [attachment] }),
      resend.emails.send({ from: fromEmail, to: studioEmail, replyTo: email, subject: 'Quotation sent · ' + reference + ' · ' + safeName, html: '<div style="font-family:Arial,sans-serif"><h2>Quotation emailed to customer</h2><p>'+safeName+' · '+escapeHtml(email)+' · '+escapeHtml(phone||'')+'</p><p>'+safeEvent+' · '+amount+' · '+safeReference+'</p></div>', attachments: [attachment] }),
    ])
    if (customerResult.error || studioResult.error) {
      console.error('Resend error', customerResult.error || studioResult.error)
      return json({ error: 'Email delivery failed. Check Resend sender verification and account limits.' }, 502)
    }
    return json({ success: true, customerEmail: email, studioNotified: true })
  } catch (error) {
    console.error(error)
    return json({ error: 'Unexpected email service error' }, 500)
  }
})
function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c))
}
