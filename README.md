# How it works

1. Fetch files and find all connections and upload gexf file
2. Find staged files
3. Upload search file
4. Convert staged files from markdown to html and upload
5. Find all connections to staged nodes and upload
6. upload non-md staged files

## File structure

- gexf -> gexf files
- html -> compiled html files
- nodes.gexf -> graph of all connections
- search.json -> array of nodes for Orama
