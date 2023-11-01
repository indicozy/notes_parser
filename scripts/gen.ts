import parser from "dir-parser";
import fs from "fs";
import Graph from "graphology";
import gexf from "graphology-gexf";

const LOCATION = "../notes";

const getPath = (file: parser.DirInfo | parser.FileInfo, filter: string) => {
  const arr: string[] = [];
  if (file.type === "directory") {
    for (const childFile of file.children) {
      const childPath = getPath(childFile, filter);
      arr.push(...childPath);
    }
  }
  if (file.absPath.split(".")[file.absPath.split(".").length - 1] !== filter) {
    return arr;
  }
  arr.push(file.path.replace(LOCATION + "/", ""));
  return arr;
};

type TConnection = { from: string; to: string };

const parseConnections: (fromPath: string, text: string) => TConnection[] = (
  fromPath,
  text
) => {
  const linkRegex = /\[\[([^\]]+)\|([^\]]+)\]\]/g;
  const matches = text.matchAll(linkRegex);

  const connections: TConnection[] = [];
  for (const match of matches) {
    connections.push({ from: fromPath, to: match[1] + ".md" });
  }

  return connections;
};

const readfile = (path: string) => {
  const buffer = fs.readFileSync(LOCATION + "/" + path);
  const fileContent = buffer.toString();
  return fileContent;
};

const parseAndReadFile = (path: string) => {
  const text = readfile(path);
  const connections = parseConnections(path, text);
  return connections;
};

const getConnections = (paths: string[]) => {
  const connections: TConnection[] = [];
  paths.forEach((path) => {
    connections.push(...parseAndReadFile(path));
  });
  return connections;
};

const randomGen = () => Math.random() * 10 - 5;

export const getGexf: () => Promise<string> = async () => {
  const data = await parser(LOCATION, {
    ignores: [".git", ".trash", ".obsidian"],
    getChildren: true,
    getFiles: true,
    dirTree: true,
  } as parser.Options);

  const graph = new Graph();

  const paths: string[] = getPath(data, "md");
  paths.forEach((path) => {
    // Node customization
    graph.addNode(path, {
      color: "#ffffff",
      size: 10,
      label: path.split("/").pop(),
      x: randomGen(),
      y: randomGen(),
      z: 0,
    });
  });

  const connections: TConnection[] = getConnections(paths);
  connections.forEach((connection) => {
    // TODO customize nodes
	  if (!graph.hasEdge(connection.from, connection.to)) {
		    graph.addEdge(connection.from, connection.to,{
      color: "#ffffff",

      });
	  }
  });

  const gexfString = gexf.write(graph);
  console.log(gexfString);
  return gexfString;
};
