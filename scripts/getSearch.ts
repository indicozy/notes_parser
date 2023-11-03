import {
  getConnectionsFromFiles,
  parseConnectionFromFileBuilder,
} from "./getParser";
import { getPathAll, pathFilter } from "./getPath";
import { headersRegex } from "./regex";

type TSearchNode = {
  url: string;
  headers: string[];
};
export const genSearch: (location: string) => Promise<TSearchNode[]> = async (
  location: string
) => {
  const paths = pathFilter(await getPathAll(location), "md");
  const matches = await Promise.all(
    paths.map(async (path) => ({
      url: path,
      headers: await parseConnectionFromFileBuilder(
        path,
        location
      )(headersRegex),
    }))
  );
  return matches;
};

export const genSearchString: (nodes: TSearchNode[]) => string = (nodes) => {
  return JSON.stringify(nodes);
};
