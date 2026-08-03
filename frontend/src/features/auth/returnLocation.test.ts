import { describe, expect, it } from "vitest";
import { resolveSafeReturnLocation } from "./returnLocation";

describe("resolveSafeReturnLocation", () => {
  it("conserve une destination interne complète", () => {
    expect(
      resolveSafeReturnLocation({
        pathname: "/inspections/42",
        search: "?tab=history",
        hash: "#details",
      }),
    ).toBe("/inspections/42?tab=history#details");
  });

  it.each([
    "//malveillant.example",
    "/\\malveillant.example",
    "https://malveillant.example",
  ])("remplace une destination non locale (%s)", (pathname) => {
    expect(resolveSafeReturnLocation({ pathname })).toBe("/dashboard");
  });

  it("rejette les suffixes contenant une barre oblique inversée", () => {
    expect(
      resolveSafeReturnLocation({
        pathname: "/events",
        search: "?next=\\malveillant.example",
      }),
    ).toBe("/dashboard");
  });
});
