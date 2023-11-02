// app.ts
import dotenv from "dotenv";
import z from "zod";

export const getDotenv = () => {
  dotenv.config(); // Load environment variables from .env file
  const zEnv = z.object({
    R2_ACCESS_KEY_ID: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    R2_ACCOUNT_ID: z.string(),
  });
  const res = zEnv.parse(process.env);
  return res;
};
