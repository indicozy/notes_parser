import parser from "dir-parser";
import { TFilesStaged } from "./getStagedFiles";

export const getFileExtension = (file: string) =>
  file.split(".")[file.split(".").length - 1];

const ignoredFiles = [".git", ".trash", ".obsidian"];

const findPathsFromTree = (file: parser.DirInfo | parser.FileInfo) => {
  const arr: string[] = [];
  // if (ignoredFiles.includes(file.name)) {
  //   return [];
  // }
  if (file.type === "directory") {
    if (file.path === ".") {
      return [];
    }
    if (file.children.length === 0) {
      return [];
    }
    for (const childFile of file.children) {
      const childPath = findPathsFromTree(childFile);
      arr.push(...childPath);
    }
  }

  // NOTE: filter by file
  // const fileExtension = getFileExtension(file.absPath);

  if (file.type === "file") {
    arr.push(file.path);
  }

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

export const findPathsFromTreeWrapper = (
  file: parser.DirInfo | parser.FileInfo,
  location: string
) => {
  const pathAbsolute = findPathsFromTree(file);
  return pathAbsolute.map((path) => path.replace(location + "/", ""));
};

export const getPathAll: (location: string) => Promise<string[]> = async (
  location
) => {
  const data = await parser(location, {
    // NOTe: filters not working
    excludes: ignoredFiles,
    getChildren: true,
    getFiles: true,
    dirTree: true,
  } as parser.Options);

  const paths: string[] = findPathsFromTreeWrapper(data, location);
  return paths;
};

export const getPathAllStructured: (
  location: string
) => Promise<TFilesStaged> = async (location) => {
  const paths = await getPathAll(location);
  return fileArrToFilesStaged(paths);
};

export const pathFilter = (paths: string[], extension: string) => {
  return paths.filter(
    (path) => path.split(".")[path.split(".").length - 1] === extension
  );
};
