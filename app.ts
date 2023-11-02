import fs from "fs";
import { getGexf } from "./scripts/getGraph";
import { genSearch, genSearchString } from "./scripts/getSearch";
import { getDotenv } from "./scripts/getEnv";
import { getFilesToUpload, getStagedFiles } from "./scripts/getStagedFiles";
import {
  convertAndUploadMarkdownMany,
  uploadDirectlyMany,
  uploadGexf,
} from "./scripts/r2Upload";

const LOCATION = "../notes";

const ENV = getDotenv();

//   await getGexf(LOCATION).then((text) => {
//     fs.writeFileSync("../notes/nodes.gexf", text);
//   });

//   // 3. update global search file
//   await genSearch(LOCATION).then((text) => {
//     fs.writeFileSync("../notes/search.json", genSearchString(text));
//   });

const run = async () => {
  // 1 update global gexf file
  await uploadGexf(LOCATION);

  // 3. update global search file
  await genSearch(LOCATION);

  // 2. get list of files to stage
  const filesToUpload = await getFilesToUpload();

  // 4. convert and upload staged files
  await convertAndUploadMarkdownMany(LOCATION, filesToUpload.md);

  // 5. find all connections to staged nodes and upload
  findAndUploadRelatedConnections();

  // 6. upload non-md staged files
  await uploadDirectlyMany(filesToUpload.nonMd);
};

run();
