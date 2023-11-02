import fs from "fs";
import { getGexf } from "./getGraph";
import { genSearch, genSearchString } from "./getSearch";

const LOCATION = "../notes";

getGexf(LOCATION).then((text) => {
  fs.writeFileSync("../notes/nodes.gexf", text);
});
genSearch(LOCATION).then((text) => {
  fs.writeFileSync("../notes/search.json", genSearchString(text));
});
