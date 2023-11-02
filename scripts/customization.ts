import { randomGen } from "./getRandom";

export const edgeConfig = () => ({
  color: "#ffffff",
  weight: 6,
});

export const nodeConfig = (path: string) => ({
  color: "#ffffff",
  size: 1,
  label: path.split("/").pop(),
  x: randomGen(),
  y: randomGen(),
  z: 0,
});
