import { readfile } from "./getFiles";
import { TConnection } from "./types";

export const parseConnectionsBuilder: (
  text: string
) => (regex: RegExp) => string[] = (text: string) => {
  const parseConnections = (regex: RegExp) => {
    const matches = text.matchAll(regex);
    // TODO: refactor
    const connections: string[] = [];
    for (const match of matches) {
      connections.push(match[1] + ".md");
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

export const parseAndReadFileBuilder: (
  path: string,
  location: string
) => (regex: RegExp) => string[] = (path: string, location: string) => {
  const parseAndReadFile = (regex: RegExp) => {
    const text = readfile(path, location);
    const connections = parseConnectionsBuilder(text)(regex);
    return connections;
  };
  return parseAndReadFile;
};

export const getConnectionsFromFiles: (
  paths: string[],
  location: string,
  regex: RegExp
) => TConnection[] = (paths, location, regex) => {
  return paths
    .map((path) =>
      genConnections(path, parseAndReadFileBuilder(path, location)(regex))
    )
    .flat();
};
