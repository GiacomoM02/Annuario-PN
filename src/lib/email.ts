import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, code: string) {
  const from = process.env.RESEND_FROM_EMAIL || "Annuario del PN <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to: email,
    subject: `Il tuo codice: ${code} — Annuario del PN`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px; background:#F4EEDF; color:#16212E;">
        <h1 style="font-size: 20px; margin-bottom: 4px;">Annuario del PN</h1>
        <p style="font-size: 14px; color:#3C5A73;">Verifica la tua email istituzionale per aggiungere la tua foto.</p>
        <div style="margin: 24px 0; padding: 16px 24px; background:#FBF8F1; border:1px solid #C9A15A; border-radius: 8px; text-align:center;">
          <span style="font-size: 32px; letter-spacing: 8px; font-weight: 700;">${code}</span>
        </div>
        <p style="font-size: 13px; color:#557089;">Il codice scade tra 5 minuti. Se non hai richiesto tu questo codice, ignora questa email — non verrà salvata da nessuna parte.</p>
      </div>
    `,
  });
}
