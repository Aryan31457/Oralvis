import nodemailer from "nodemailer"
import config from "../config/server-config.js"
const transporter = nodemailer.createTransport({
    host: config.SMTP_SERVER,  // use your actual SMTP server
    port: config.SMTP_PORT,                    // or 587 for TLS
    secure: true,
    auth: {
        user: config.EMAIL_ID,
        pass: config.EMAIL_PASS
    }
});

export const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: config.EMAIL_ID,
            to,
            subject,
            text
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendForgotPasswordEmail = async (toEmail, resetLink, userName) => {
    const mailOptions = {
        from: config.EMAIL_ID,
        to: toEmail,
        subject: 'Reset Your Password - Schedula',
        html: `
      <div style="font-family:sans-serif; max-width:600px; margin:auto;">
        <h2 style="color:#333;">Hi ${userName || ''},</h2>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="${resetLink}" style="background-color:#28a745;color:white;padding:12px 20px;
          text-decoration:none;border-radius:5px;display:inline-block;margin:20px 0;">
          Reset Password
        </a>
        <p>If the button doesn't work, copy this link and open it in your browser:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 10 minutes.</p>
        <hr/>
        <p style="color:#888; font-size:12px;">If you did not request a password reset, you can ignore this email.</p>
        <p style="color:#ccc; font-size:12px;">© ${new Date().getFullYear()} Schedula</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};