import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4173",
    supportFile: false,
    video: false,
    retries: { runMode: 2, openMode: 0 },
  },
});
