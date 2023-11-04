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

const CONCURRENCY_RATE = 3;

const s3Client = getS3Client();
const env = getDotenv();

const resizeImage = async (str: string) => {
  // TODO:
  await sharp(str).webp({ quality: 75 }).toBuffer();
};

export const uploadDirectlyOne = async (path: string, body: string) => {
  // console.log("UPLOADING", path);
  // return "OK";
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
  console.log("TO UPLOAD:", "/" + path);

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

export const uploadDirectlyMany = async (
  paths: { from: string; to: string }[],
  location: string
) => {
  // TODO: improve it by making it generic
  const { results } = await PromisePool.withConcurrency(CONCURRENCY_RATE)
    .for(paths)
    .process(async (path) => {
      const file = (await readFileWrapper(path.from, location)).toString();
      return uploadDirectlyOne(path.to, file);
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

// It's just more debuggable
export const convertAndUploadMarkdownOne = (location: string, path: string) =>
  new Promise((resolve) => {
    readFileWrapper(path, location).then((buffer) => {
      const text = buffer.toString();
      const html = convertMarkdownToHtml(text);
      uploadDirectlyOne(`markdown/${path}`, html).then((data) => resolve(null));
    });
  });

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
  const connections = await getConnectionsFromFile(path, location, linkRegex);
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
  const connections = await getConnectionsFromFiles(paths, location, linkRegex);
  const pathsAffected = getUniqueStrings(connections.map(({ to }) => to));
  const { results } = await PromisePool.withConcurrency(CONCURRENCY_RATE)
    .for(pathsAffected)
    .process((path) => uploadRelatedConnectionOne(location, path));

  return results;
};
