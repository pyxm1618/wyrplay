import { expect, it } from "vitest";
import { GET } from "@/app/api/wyr/questions/route";
import { getPlayableQuestions } from "@/modules/would-you-rather/data/questions";

it("serves only the approved canonical database without a voting identity", async () => {
  const response = GET();
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(getPlayableQuestions());
  expect(response.headers.get("set-cookie")).toBeNull();
  expect(response.headers.get("x-robots-tag")).toContain("noindex");
});
