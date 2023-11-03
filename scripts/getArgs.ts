import { type TArg, argArr } from "./types";

export const getArgType = () => {
  const arg = process.argv[process.argv.length - 1]?.replace("--", "");
  if (arg === undefined) {
    throw Error("wat");
  }
  if (!(argArr as string[]).includes(arg)) {
    throw Error("args are not set");
  }
  return arg as TArg;
};
