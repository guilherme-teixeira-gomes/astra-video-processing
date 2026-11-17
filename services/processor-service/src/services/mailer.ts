import nodemailer from "nodemailer";

/**
 * Notifica o usuário por e-mail em caso de erro no processamento.
 * Usa SMTP (configurável). Se não houver config, apenas loga (não quebra o fluxo).
 */
export async function notifyError(to: string, videoName: string, reason: string): Promise<void> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.log(JSON.stringify({ level: "warn", message: "SMTP não configurado, email não enviado", to, videoName }));
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "no-reply@fiapx.com",
    to,
    subject: `Falha no processamento do vídeo ${videoName}`,
    text: `Olá,\n\nHouve um erro ao processar o seu vídeo "${videoName}".\nMotivo: ${reason}\n\nPor favor, tente novamente.\n\nEquipe FIAP X`,
  });
}
