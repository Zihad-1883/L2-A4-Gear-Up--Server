import { configDotenv } from "dotenv";
import { env } from "process";

configDotenv();

const config = {
  PORT: env.PORT || 5000,
  DATABASE_URL:
    env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/gearup",
  APP_URL: env.APP_URL || env.BACKEND_URL || "http://localhost:5000",
  BACKEND_URL: env.BACKEND_URL || env.APP_URL || "https://gearup-backend-4eca.onrender.com",
  FRONTEND_URL: env.FRONTEND_URL || "http://localhost:3000",
  BCRYPT_SALT_ROUNDS: env.BCRYPT_SALT_ROUNDS || 10,
  JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
  SSLCOMMERZ_STORE_ID: env.SSLCOMMERZ_STORE_ID || "testbox",
  SSLCOMMERZ_STORE_PASSWORD: env.SSLCOMMERZ_STORE_PASSWORD || "qwerty",
  SSLCOMMERZ_IS_LIVE: env.SSLCOMMERZ_IS_LIVE === "true",
};

export default config;
