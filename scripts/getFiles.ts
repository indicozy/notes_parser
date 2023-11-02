import fs from "fs";

export const readfile = (path: string, location: string) => {
  const pathFinal = location + "/" + path;
  const buffer = fs.readFileSync(pathFinal);
  const fileContent = buffer.toString();
  return fileContent;
};
