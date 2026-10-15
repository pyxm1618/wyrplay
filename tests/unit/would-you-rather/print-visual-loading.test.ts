import { afterEach, expect, it, vi } from "vitest";
import { getVisualImage } from "@/modules/would-you-rather/ui/play/print-renderer";

afterEach(() => vi.unstubAllGlobals());

it("sets anonymous CORS before loading a master so exported canvases stay readable", async () => {
  const operations: string[] = [];
  class BrowserImage {
    set crossOrigin(value: string) {
      operations.push(`cors:${value}`);
    }
    set src(value: string) {
      operations.push(`src:${value}`);
    }
    async decode() {
      operations.push("decode");
    }
  }
  vi.stubGlobal("Image", BrowserImage);
  const src = "https://media.wyrplay.com/questions/v1/test-master.png";
  await getVisualImage(src);
  expect(operations).toEqual(["cors:anonymous", `src:${src}`, "decode"]);
});
