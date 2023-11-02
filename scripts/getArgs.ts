import { type TArg, argArr } from "./types";

export const getArgType = () => {
  const arg = process.argv.pop()?.replace("--", "");
  if (arg === undefined) {
    throw Error("wat");
  }
  if (!(argArr as string[]).includes(arg)) {
    throw Error("args are not set");
  }
  return arg as TArg;
};
