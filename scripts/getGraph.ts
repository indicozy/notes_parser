import Graph from "graphology";
import gexf from "graphology-gexf";
import { getPathAll } from "./getPath";
import { randomGen } from "./getRandom";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { edgeConfig, nodeConfig } from "./customization";
import { linkRegex } from "./regex";
import { getConnectionsFromFiles } from "./getParser";

export const getGraph = async (location: string) => {
  const graph = new Graph();

  const paths = await getPathAll(location);
  paths.forEach((path) => {
    // Node customization
    graph.addNode(path, nodeConfig(path));
  });
  const connections = getConnectionsFromFiles(paths, location, linkRegex);
  connections.forEach((connection) => {
    if (!graph.hasEdge(connection.from, connection.to)) {
      graph.addEdge(connection.from, connection.to, edgeConfig());
    }
  });
  forceAtlas2.assign(graph, {
    iterations: 50000,
    settings: {
      adjustSizes: false,
      barnesHutOptimize: true,
      barnesHutTheta: 1,
      edgeWeightInfluence: 0, // todo experiment with 1000+ nodes
      gravity: 0.5,
      linLogMode: true,
      outboundAttractionDistribution: true,
      slowDown: 10,
    },
  });
  return graph;
};

export const graphToGexf: (graph: Graph) => string = (graph) => {
  const gexfString = gexf.write(graph);
  return gexfString;
};

export const getGexf: (location: string) => Promise<string> = async (
  location
) => {
  const graph = await getGraph(location);
  return graphToGexf(graph);
};
