import parser from "dir-parser";
import { TFilesStaged } from "./getStagedFiles";

export const getFileExtension = (file: string) =>
  file.split(".")[file.split(".").length - 1];

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
  const fileExtension = getFileExtension(file.absPath);

  if (!filters.includes(fileExtension)) {
    return arr;
  }
  arr.push(file.path);
  return arr;
};

export const fileArrToFilesStaged: (stagedFiles: string[]) => TFilesStaged = (
  stagedFiles
) => {
  const stagedFilesObj: TFilesStaged = { md: [], nonMd: [] };
  stagedFiles.forEach((filePath) => {
    const fileExtension = getFileExtension(filePath);
    if (fileExtension === "md") {
      stagedFilesObj.md.push(filePath);
    } else {
      stagedFilesObj.nonMd.push(filePath);
    }
  });
  return stagedFilesObj;
};

export const findPathsFromTreeFiltered = (
  file: parser.DirInfo | parser.FileInfo,
  filters: string[],
  location: string
) => {
  const pathAbsolute = findPathsFromTree(file, filters);
  return pathAbsolute.map((path) => path.replace(location + "/", ""));
};

export const getPathAll: (location: string) => Promise<string[]> = async (
  location
) => {
  const data = await parser(location, {
    // TODO: filters not working
    ignores: [".git", ".trash", ".obsidian"],
    getChildren: true,
    getFiles: true,
    dirTree: true,
  } as parser.Options);

  const paths: string[] = findPathsFromTreeFiltered(data, ["md"], location);
  return paths;
};

export const getPathAllStructured: (
  location: string
) => Promise<TFilesStaged> = async (location) => {
  const paths = await getPathAll(location);
  return fileArrToFilesStaged(paths);
};
