import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client } from "./r2Client";
import { getGexf } from "./getGraph";
import { genSearch, genSearchString } from "./getSearch";
import { readFile, readFileWrapper } from "./getFiles";
import { convertMarkdownToHtml } from "./getMarkdown";

const s3Client = getS3Client();

export const uploadDirectlyOne = async (path: string, body: string) => {
  // TODO:
};
export const uploadDirectlyMany = async (paths: string[]) => {
  // TODO:
};

export const uploadGexf = async (rootPath: string) => {
  const text = await getGexf(rootPath);
  await uploadDirectlyOne("./graph.gexf", text);
};

export const uploadSearch = async (rootPath: string) => {
  const text = genSearchString(await genSearch(rootPath));
  await uploadDirectlyOne("./search.json", text);
};

export const convertAndUploadMarkdownOne = async (
  location: string,
  path: string
) => {
  const text = await readFileWrapper(location, path);
  const html = convertMarkdownToHtml(text);
  await uploadDirectlyOne(path, html);
};

export const convertAndUploadMarkdownMany = async (
  location: string,
  paths: string[]
) => {
  // TODO: make some buffering Generic
  // convertAndUploadMarkdown;
};
