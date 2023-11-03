import { getDotenv } from "../scripts/getEnv";

/* 
This file has extensions for showdown, made for integration with Obsidian
 */
const env = getDotenv();

// ![[url name | text]] -> <image>
export const myextPhoto = {
  type: "lang",
  filter: (markdownText: string) => {
    /// made by ChatGPT
    const linkRegex = /!\[\[([^\]]+)\]\]/g;

    // Replace Markdown links with HTML <a> tags
    const htmlText = markdownText.replace(linkRegex, `<image src="/$1"/>`);
    return htmlText;
  },
};

export const myext1regex = /\[\[([^\]]+)\|([^\]]+)\]\]/g;
export const myext1func = (markdownText: string) => {
  /// made by ChatGPT

  // Replace Markdown links with HTML <a> tags
  const htmlText = markdownText.replace(
    myext1regex,
    '<a href="/notes/$1.md">$2</a>'
  );
  return htmlText;
};
// [[url name | text]] -> <a>
export const myext1 = {
  type: "lang",
  filter: myext1func,
};

// [[text]] -> <i>
export const myext2 = {
  type: "lang",
  filter: (markdownText: string) => {
    /// made by ChatGPT
    const linkRegex = /\[\[([^\]]+)\]\]/g;

    // Replace Markdown links with HTML <a> tags
    const htmlText = markdownText.replace(linkRegex, "<i>$1</i>");
    return htmlText;
  },
};

export const showdownExtensions = [myextPhoto, myext1, myext2];
