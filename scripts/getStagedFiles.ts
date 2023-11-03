import util from "util";
import { getArgType } from "./getArgs";
import { fileArrToFilesStaged, getPathAllStructured } from "./getPath";

const exec = util.promisify(require("child_process").exec);
const command = (location: string) =>
  `cd ${location}; git diff --name-only --cached`;
const PATH = "../notes";
export type TFilesStaged = {
  md: string[];
  nonMd: string[];
};
export const getStagedFiles: () => Promise<string[]> = async () => {
  try {
    const { stdout, stderr } = await exec(command(PATH));
    const files: string[] = stdout.trim().split("\n");
    return files;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getFilesToUpload: () => Promise<TFilesStaged> = async () => {
  const arg = getArgType();
  if (arg === "all") {
    return getPathAllStructured(PATH);
  }
  const stagedFiles = await getStagedFiles();
  return fileArrToFilesStaged(stagedFiles);
};
