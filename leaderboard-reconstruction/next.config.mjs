import { fileURLToPath } from "node:url";
export default {
  devIndicators: false,
  output: "export",
  images: { unoptimized: true },
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
};
