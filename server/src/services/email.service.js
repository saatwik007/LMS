async function sendOtpEmail(to, otp) {
  // Example using Resend HTTP API (works on Vercel/Render)
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY not configured');

  const from = process.env.MAIL_FROM_ADDRESS || 'onboarding@resend.dev';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Your OTP code',
      html: `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
    })
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => '');
    throw new Error(`Email send failed: ${response.status} ${txt}`);
  }

  return response.json();
}

module.exports = { sendOtpEmail };