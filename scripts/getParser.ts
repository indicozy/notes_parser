import { readFileWrapper } from "./getFiles";
import { TConnection } from "./types";

export const attachMdExtension: (texts: string[]) => string[] = (texts) => {
  return texts.map((text) => text + ".md");
};

export const parseConnectionsBuilder: (
  text: string
) => (regex: RegExp) => string[] = (text: string) => {
  const parseConnections = (regex: RegExp) => {
    const matches = text.matchAll(regex);
    const connections: string[] = [];
    for (const match of matches) {
      connections.push(match[1]);
    }
    return connections;
  };
  return parseConnections;
};

export const genConnections: (
  path: string,
  connections: string[]
) => TConnection[] = (path, connections) => {
  return connections.map((connection) => ({ from: path, to: connection }));
};

export const parseConnectionFromFileBuilder: (
  path: string,
  location: string
) => (regex: RegExp) => Promise<string[]> = (
  path: string,
  location: string
) => {
  const parseAndReadFile = async (regex: RegExp) => {
    // console.log(path, location);
    // NOTE: maybe buggy here
    const text: string = (await readFileWrapper(path, location)).toString();
    const connections = parseConnectionsBuilder(text)(regex);
    return connections;
  };
  return parseAndReadFile;
};

export const getConnectionsFromFile: (
  path: string,
  location: string,
  regex: RegExp
) => Promise<TConnection[]> = async (path, location, regex) =>
  genConnections(
    path,
    attachMdExtension(
      await parseConnectionFromFileBuilder(path, location)(regex)
    )
  );

export const getConnectionsFromFiles: (
  paths: string[],
  location: string,
  regex: RegExp
) => Promise<TConnection[]> = (paths, location, regex) => {
  return Promise.all(
    paths.map((path) => getConnectionsFromFile(path, location, regex))
  ).then((res) => res.flat());
};
