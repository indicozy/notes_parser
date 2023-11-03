import fs from "fs";

// export const readFile = (path: string) => {
//   const buffer = fs.readFileSync(path);
//   const fileContent = buffer.toString();
//   return fileContent;
// };

type TCallback = (data: Buffer) => void;
type TFunc = { callback: TCallback; path: string };

const queue: TFunc[] = [];
const run: (path: string, callback: TCallback) => Promise<Buffer> = (path) =>
  new Promise((resolve) => {
    fs.readFile(path, (err, data) => {
      const n = queue.shift();
      resolve(data);
      if (n !== undefined) {
        run(n.path, n.callback);
      }
    });
  });

export const readFileWrapper: (
  path: string,
  location: string
) => Promise<Buffer> = (path, location) =>
  new Promise((resolve) => {
    const pathFinal = location + "/" + path;
    if (queue.length === 0) {
      run(pathFinal, (data) => resolve(data));
    } else {
      queue.push({ callback: (data) => resolve(data), path: pathFinal });
    }

    fs.readFile("", (err, data) => resolve(data));
  });
