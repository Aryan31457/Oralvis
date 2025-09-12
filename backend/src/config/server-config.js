import dotenv from "dotenv";
dotenv.config();
export default {
    PORT: process.env.PORT,
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    EMAIL_ID: process.env.EMAIL_ID,
    EMAIL_PASS: process.env.EMAIL_PASS,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SERVER: process.env.SMTP_SERVER,
    FRONTEND_URL: process.env.FRONTEND_URL,
    ADMIN_URL: process.env.ADMIN_URL,
    FORGET_PASSWORD_EXPIRY: process.env.FORGET_PASSWORD_EXPIRY
}