import { getDotenv } from "./getEnv";
import AWS from "aws-sdk";

let s3Client: AWS.S3 | undefined = undefined;

const env = getDotenv();

export const getS3Client: () => AWS.S3 = () => {
  if (s3Client === undefined) {
    const endpoint = new AWS.Endpoint(env.R2_ENDPOINT);

    // @ts-ignore
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

    s3Client = new AWS.S3({
      endpoint: endpoint,
      region: "auto",
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      s3ForcePathStyle: true, // needed with minio?
      maxRetries: 10,
    });
    return s3Client;
  }
  return s3Client;
};
