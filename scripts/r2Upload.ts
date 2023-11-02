import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client } from "./r2Client";
import { getGexf, getGraph, graphToGexf } from "./getGraph";
import { genSearch, genSearchString } from "./getSearch";
import { readFile, readFileWrapper } from "./getFiles";
import { convertMarkdownToHtml } from "./getMarkdown";
import PromisePool from "@supercharge/promise-pool";
import { getDotenv } from "./getEnv";
import { getConnectionsFromFile, getConnectionsFromFiles } from "./getParser";
import { linkRegex } from "./regex";
import Graph from "graphology";
import { edgeConfig, nodeConfig } from "./customization";

const CONCURRENCY_RATE = 10;

const s3Client = getS3Client();
const env = getDotenv();

export const uploadDirectlyOne = async (path: string, body: string) => {
  // TODO: test it
  console.log(path, body);
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: path,
    Body: body,
  });
  try {
    const response = await s3Client.send(command);
    console.log("uploaded:", path);
  } catch (err) {
    console.error(err);
  }
};

export const uploadDirectlyMany = async (paths: string[], location: string) => {
  // TODO: improve it by making it generic
  const { results } = await PromisePool.withConcurrency(CONCURRENCY_RATE)
    .for(paths)
    .process((path) => {
      const file = readFileWrapper(path, location);
      return uploadRelatedConnectionOne(location, path);
    });

  return results;
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
  await uploadDirectlyOne(path, gexf);
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
