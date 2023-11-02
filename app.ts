import fs from "fs";
import { getGexf } from "./scripts/getGraph";
import { genSearch, genSearchString } from "./scripts/getSearch";
import { getDotenv } from "./scripts/getEnv";
import { getFilesToUpload, getStagedFiles } from "./scripts/getStagedFiles";

const LOCATION = "../notes";

const ENV = getDotenv();

const run = async () => {
  // 1 update global gexf file
  getGexf(LOCATION).then((text) => {
    fs.writeFileSync("../notes/nodes.gexf", text);
  });

  // 3. update global search file
  genSearch(LOCATION).then((text) => {
    fs.writeFileSync("../notes/search.json", genSearchString(text));
  });

  // 2. get list of files to stage
  const filesToUpload = getFilesToUpload();

  // 4. convert and upload staged files

  // 5. find all connections to staged nodes and upload

  // 6. upload non-md staged files
};

run();
