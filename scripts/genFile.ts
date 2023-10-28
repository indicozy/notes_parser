import {getGexf} from "./gen"
import fs from "fs"

getGexf().then((text)=> {
   fs.writeFileSync("../notes/nodes.gexf", text) 
})