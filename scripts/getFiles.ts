import fs from "fs";

// export const readFile = (path: string) => {
//   const buffer = fs.readFileSync(path);
//   const fileContent = buffer.toString();
//   return fileContent;
// };

type TCallback = (data: Buffer) => void;
type TFunc = { callback: TCallback; path: string };

const queue: TFunc[] = [];
let isRunnning: boolean = false;
const run: (path: string, callback: TCallback) => void = (path, callback) => {
  isRunnning = true;
  fs.readFile(path, (_, data) => {
    callback(data);

    const n = queue.shift();
    if (n !== undefined) {
      run(n.path, n.callback);
    } else {
      isRunnning = false;
    }
  });
};

export const readFileWrapper: (
  path: string,
  location: string
) => Promise<Buffer> = (path, location) =>
  new Promise((resolve) => {
    const pathFinal = location + "/" + path;
    const callback = (data: Buffer) => {
      resolve(data);
    };
    if (isRunnning) {
      queue.push({ callback, path: pathFinal });
    } else {
      run(pathFinal, callback);
    }
  });

// I don't need that, but I spent too much effort to do that so I'm not deleting it
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
