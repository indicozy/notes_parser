import fs from "fs";

export const readFile = (path: string) => {
  const buffer = fs.readFileSync(path);
  const fileContent = buffer.toString();
  return fileContent;
};

export const readFileWrapper = (path: string, location: string) => {
  const pathFinal = location + "/" + path;
  return readFile(pathFinal);
};
