import { TFilesStaged, getFilesToUpload } from "./scripts/getStagedFiles";
import "@total-typescript/ts-reset";
import {
  convertAndUploadMarkdownMany,
  findAndUploadRelatedConnections,
  uploadDirectlyMany,
  uploadGexf,
  uploadSearch,
} from "./scripts/r2Upload";

const LOCATION = "../notes";

const uploadNonMdFiles = (location: string, filesToUpload: string[]) => {
  return uploadDirectlyMany(
    filesToUpload.map((path) => ({ from: path, to: `markdown/${path}` })),
    location
  );
};

const run = async () => {
  // 1 update global gexf file
  await uploadGexf(LOCATION);

  // 3. update global search file
  await uploadSearch(LOCATION);

  // 2. get list of files to stage
  const filesToUpload = await getFilesToUpload();
  console.log(filesToUpload);

  // 4. convert and upload staged md files
  // await convertAndUploadMarkdownMany(LOCATION, filesToUpload.md);
  // no conversion for now
  await uploadNonMdFiles(LOCATION, filesToUpload.md);

  // 5. find all connections to staged nodes and upload
  await findAndUploadRelatedConnections(LOCATION, filesToUpload.md);

  // 6. upload non-md staged files
  await uploadNonMdFiles(LOCATION, filesToUpload.nonMd);
};

run();
