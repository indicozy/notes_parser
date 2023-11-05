// app.ts
import dotenv from "dotenv";
import z from "zod";

export const getDotenv = () => {
  const lol = dotenv.config({ path: __dirname + "/../.env" }); // Load environment variables from .env file
  const zEnv = z.object({
    R2_ACCESS_KEY_ID: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    R2_PUBLIC_URL: z.string(),
    S3_BUCKET: z.string(),
    R2_ENDPOINT: z.string(),
  });
  const res = zEnv.parse(process.env);
  return res;
};
