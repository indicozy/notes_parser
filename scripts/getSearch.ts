import { getConnectionsFromFiles, parseAndReadFileBuilder } from "./getParser";
import { getPathAll } from "./getPath";
import { headersRegex } from "./regex";

type TSearchNode = {
  url: string;
  headers: string[];
};
export const genSearch: (location: string) => Promise<TSearchNode[]> = async (
  location: string
) => {
  const paths = await getPathAll(location);
  const matches = paths.map(async (path) => ({
    url: path,
    headers: await parseAndReadFileBuilder(path, location)(headersRegex),
  }));
  return matches;
};

export const genSearchString: (nodes: TSearchNode[]) => string = (nodes) => {
  return JSON.stringify(nodes);
};
