import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from "./r2Client";
import { getGexf, graphToGexf } from "./getGraph";
import { genSearch, genSearchString } from "./getSearch";
import { readFileWrapper } from "./getFiles";
import { convertMarkdownToHtml } from "./getMarkdown";
import PromisePool from "@supercharge/promise-pool";
import { getDotenv } from "./getEnv";
import { getConnectionsFromFile, getConnectionsFromFiles } from "./getParser";
import { linkRegex } from "./regex";
import Graph from "graphology";
import { edgeConfig, nodeConfig } from "./customization";
import sharp from "sharp";

const CONCURRENCY_RATE = 10;

const s3Client = getS3Client();
const env = getDotenv();

const resizeImage = async (str: string) => {
  // TODO:
  await sharp(str).webp({ quality: 75 }).toBuffer();
};

type uploadType = "md" | "graph" | "normal";

export const uploadDirectlyOne = async (path: string, body: string) => {
  // TODO: test it
  const buf = Buffer.from(body, "utf8");

  const options = {
    partSize: 10 * 1024 * 1024,
    // how many concurrent uploads
    queueSize: 5,
  };
  const fileParameters = {
    Key: path,
  };

  const params = {
    Bucket: env.S3_BUCKET,
  };

  try {
    await s3Client
      .upload({ ...params, ...fileParameters, Body: buf }, options)
      .promise();
    console.log("uploaded:", path);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const uploadDirectlyMany = async (paths: string[], location: string) => {
  // TODO: improve it by making it generic
  const { results } = await PromisePool.withConcurrency(CONCURRENCY_RATE)
    .for(paths)
    .process((path) => {
      const file = readFileWrapper(path, location);
      return uploadDirectlyOne(location + path, file);
    });

  return results;
};

export const uploadGexf = async (rootPath: string) => {
  const text = await getGexf(rootPath);
  await uploadDirectlyOne("graph.gexf", text);
};

export const uploadSearch = async (rootPath: string) => {
  const text = genSearchString(await genSearch(rootPath));
  await uploadDirectlyOne("search.json", text);
};

export const convertAndUploadMarkdownOne = async (
  location: string,
  path: string
) => {
  console.log("BRUH", `markdown/${path}`);
  const text = readFileWrapper(location, path);
  console.log(`markdown/${path}`, text);
  const html = convertMarkdownToHtml(text);
  await uploadDirectlyOne(`markdown/${path}`, html);
};

export const convertAndUploadMarkdownMany = async (
  location: string,
  paths: string[]
) => {
  console.log(paths);
  const { results } = await PromisePool.withConcurrency(CONCURRENCY_RATE)
    .for(paths)
    .process((path) => convertAndUploadMarkdownOne(location, path));

  return results;
};

const getUniqueStrings = (arr: string[]) => [...new Set(arr)];

export const uploadRelatedConnectionOne = async (
  location: string,
  path: string
) => {
  const connections = getConnectionsFromFile(path, location, linkRegex);
  const pathsAffected = getUniqueStrings(connections.map(({ to }) => to));
  const graph = new Graph();

  graph.addNode(path, nodeConfig(path));
  pathsAffected.forEach((pathAffected) => {
    if (!graph.hasNode(pathAffected)) {
      graph.addNode(pathAffected, nodeConfig(path));
    }
    if (!graph.hasEdge(path, pathAffected)) {
      graph.addEdge(path, pathAffected, edgeConfig());
    }
  });
  const gexf = graphToGexf(graph);
  await uploadDirectlyOne(`graph/${path}`, gexf);
};

export const findAndUploadRelatedConnections = async (
  location: string,
  paths: string[]
) => {
  const connections = getConnectionsFromFiles(paths, location, linkRegex);
  const pathsAffected = getUniqueStrings(connections.map(({ to }) => to));
  const { results } = await PromisePool.withConcurrency(CONCURRENCY_RATE)
    .for(pathsAffected)
    .process((path) => uploadRelatedConnectionOne(location, path));

  return results;
};
