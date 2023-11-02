import { S3Client } from "@aws-sdk/client-s3";
import { getDotenv } from "./getEnv";

let s3Client: S3Client | undefined = undefined;

const env = getDotenv();

export const getS3Client: () => S3Client = () => {
  if (s3Client === undefined) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
    return s3Client;
  } else {
    return s3Client;
  }
};

export {};
