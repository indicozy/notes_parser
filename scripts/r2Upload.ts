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
// @ts-ignore
import mimetype from "mime-types";
import forceLayout from "graphology-layout-force";
import { getFileExtension } from "./getPath";

const CONCURRENCY_RATE = 3;

const s3Client = getS3Client();
const env = getDotenv();

const resizeImage = async (buffer: Buffer) => {
  console.log("resizing");
  return await sharp(buffer).resize(1080, 1080, { fit: "outside" }).toBuffer();
};

export const uploadDirectlyOne = async (path: string, body: Buffer) => {
  // console.log("UPLOADING", path);
  // return "OK";

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
  const mimetype1 =
    mimetype.contentType(path.split("/")[path.split("/").length - 1]) ||
    "text/plain";

  try {
    await s3Client
      .upload(
        {
          ...params,
          ...fileParameters,
          Body: body,
          ContentType: mimetype1,
        },
        options
      )
      .promise();
    // console.log("uploaded:", path);
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
      const file = await readFileWrapper(path.from, location);
      const fileExtension =
        path.from.split(".")[path.from.split(".").length - 1];
      if (["png", "jpeg", "jpg", "webp"].includes(fileExtension)) {
        return uploadDirectlyOne(path.to, await resizeImage(file));
      }
      return uploadDirectlyOne(path.to, file);
    });

  return results;
};

export const uploadGexf = async (rootPath: string) => {
  const text = await getGexf(rootPath);
  const buffer = Buffer.from(text);
  await uploadDirectlyOne("graph.gexf", buffer);
};

export const uploadSearch = async (rootPath: string) => {
  const text = genSearchString(await genSearch(rootPath));
  const buffer = Buffer.from(text);
  await uploadDirectlyOne("search.json", buffer);
};

// It's just more debuggable
export const convertAndUploadMarkdownOne = (location: string, path: string) =>
  new Promise((resolve) => {
    readFileWrapper(path, location).then((buffer) => {
      const text = buffer.toString();
      const html = convertMarkdownToHtml(text);
      const bufferHtml = Buffer.from(html);
      uploadDirectlyOne(`markdown/${path}`, bufferHtml).then((data) =>
        resolve(null)
      );
    });
  });

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
  const connections = await getConnectionsFromFile(path, location, linkRegex);
  const pathsAffected = getUniqueStrings(connections.map(({ to }) => to));
  const graph = new Graph();

  graph.addNode(path, nodeConfig(path));
  pathsAffected.forEach((pathAffected) => {
    if (!graph.hasNode(pathAffected)) {
      graph.addNode(pathAffected, nodeConfig(pathAffected));
    }
    if (!graph.hasEdge(path, pathAffected)) {
      graph.addEdge(path, pathAffected, edgeConfig());
    }
  });

  forceLayout.assign(graph, 3000);
  const gexf = graphToGexf(graph);
  const buffer = Buffer.from(gexf);
  await uploadDirectlyOne(`graph/${path}`, buffer);
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
