import { randomGen } from "./getRandom";

export const edgeConfig = () => ({
  color: "#ffffff",
  weight: 6,
});

export const nodeConfig = (path: string) => ({
  color: "#ffffff",
  size: 1,
  // https://flexiple.com/javascript/get-last-array-element-javascript
  label: path.split("/").pop(),
  x: randomGen(),
  y: randomGen(),
  z: 0,
});
