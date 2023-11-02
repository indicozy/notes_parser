import parser from "dir-parser";

const findPathsFromTree = (
  file: parser.DirInfo | parser.FileInfo,
  filters: string[]
) => {
  const arr: string[] = [];
  if (file.type === "directory") {
    for (const childFile of file.children) {
      const childPath = findPathsFromTree(childFile, filters);
      arr.push(...childPath);
    }
  }
  const fileExtension =
    file.absPath.split(".")[file.absPath.split(".").length - 1];
  if (!filters.includes(fileExtension)) {
    return arr;
  }
  arr.push(file.path);
  return arr;
};

export const findPathsFromTreeFiltered = (
  file: parser.DirInfo | parser.FileInfo,
  filters: string[],
  location: string
) => {
  const pathAbsolute = findPathsFromTree(file, filters);
  return pathAbsolute.map((path) => path.replace(location + "/", ""));
};

export const getPathAll = async (location: string) => {
  const data = await parser(location, {
    ignores: [".git", ".trash", ".obsidian"],
    getChildren: true,
    getFiles: true,
    dirTree: true,
  } as parser.Options);

  console.log(data);
  const paths: string[] = findPathsFromTreeFiltered(data, ["md"], location);
  return paths;
};
