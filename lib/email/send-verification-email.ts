import { Resend } from 'resend';

interface SendVerificationEmailOptions {
  email: string;
  name?: string | null;
  code: string;
  expiresInMinutes: number;
}

let resendClient: Resend | null = null;

const getResendClient = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set.');
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
};

const getFromAddress = (): string => {
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) {
    throw new Error('RESEND_FROM_EMAIL environment variable is not set.');
  }

  return fromEmail;
};

export const sendVerificationEmail = async ({
  email,
  name,
  code,
  expiresInMinutes,
}: SendVerificationEmailOptions): Promise<void> => {
  const resend = getResendClient();
  const from = getFromAddress();
  const subject = 'Verify your email for My Mentor GPT';
  const displayName = name ?? 'there';
  const expiresText = `${expiresInMinutes} minute${expiresInMinutes === 1 ? '' : 's'}`;

  const html = `
    <table style="width:100%;max-width:480px;margin:0 auto;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;">
      <tr>
        <td style="padding:24px 0;text-align:center;">
          <h1 style="margin:0;font-size:24px;font-weight:600;">Verify your email</h1>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
          <p style="margin:0 0 16px;font-size:16px;">Hi ${displayName},</p>
          <p style="margin:0 0 24px;font-size:16px;">Use the code below to verify your email address. The code expires in ${expiresText}.</p>
          <div style="display:inline-block;padding:16px 24px;border-radius:12px;background:#111827;color:#ffffff;font-size:32px;font-weight:700;letter-spacing:8px;">
            ${code}
          </div>
          <p style="margin:24px 0 0;font-size:14px;color:#6b7280;">If you did not request this, you can safely ignore this email.</p>
        </td>
      </tr>
      <tr>
        <td style="text-align:center;padding:24px 0 0;font-size:12px;color:#9ca3af;">
          &copy; ${new Date().getFullYear()} My Mentor GPT. All rights reserved.
        </td>
      </tr>
    </table>
  `;

  const text = `Hi ${displayName},\n\nUse the code ${code} to verify your email address. This code expires in ${expiresText}.\n\nIf you did not request this email, you can ignore it.\n\n— My Mentor GPT`;

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message);
  }
};

