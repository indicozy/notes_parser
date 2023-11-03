import fs from "fs";

// export const readFile = (path: string) => {
//   const buffer = fs.readFileSync(path);
//   const fileContent = buffer.toString();
//   return fileContent;
// };

type TCallback = (data: Buffer) => void;
type TFunc = { callback: TCallback; path: string };

// It's overengineered a bit because it worked fine without it.
const queue: TFunc[] = [];
const run: (path: string, callback: TCallback) => Promise<Buffer> = (
  path,
  callback
) =>
  new Promise((resolve) => {
    fs.readFile(path, (err, data) => {
      const n = queue.shift();
      if (n !== undefined) {
        run(n.path, n.callback);
      }
      resolve(data);
    });
  });

export const readFileWrapper: (
  path: string,
  location: string
) => Promise<Buffer> = (path, location) =>
  new Promise((resolve) => {
    const pathFinal = location + "/" + path;
    const callback = (data: Buffer) => {
      resolve(data);
    };
    if (queue.length === 0) {
      run(pathFinal, callback);
    } else {
      queue.push({ callback, path: pathFinal });
    }
  });

// I don't need that, but I spent too much effort to do that so I'm not deleting it
// Upd: Ah, I needed it
export const funcAsyncOneByOne = async <T extends any[], F>(
  func: (...args: T) => Promise<F>,
  args: T[]
) => {
  const arr: F[] = [];
  for await (const arg of args) {
    arr.push(await func.apply(arg));
  }
  return arr;
};
