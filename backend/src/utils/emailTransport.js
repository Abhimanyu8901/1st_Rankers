const nodemailer = require("nodemailer");

let transporter;

const buildTransport = () => {
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport(process.env.SMTP_URL);
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Email service is not configured. Add SMTP settings to backend/.env");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user,
      pass
    }
  });
};

const getTransport = () => {
  if (!transporter) {
    transporter = buildTransport();
  }

  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error("MAIL_FROM or SMTP_USER must be configured");
  }

  return getTransport().sendMail({
    from,
    to,
    subject,
    text,
    html
  });
};

module.exports = { sendEmail };
