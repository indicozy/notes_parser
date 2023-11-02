import { showdownExtensions } from "../utils/showdownEextensions";
import showdown from "showdown";

export const convertMarkdownToHtml = (text: string) => {
  const converter = new showdown.Converter({
    extensions: showdownExtensions,
  });
  return converter.makeHtml(text);
};
