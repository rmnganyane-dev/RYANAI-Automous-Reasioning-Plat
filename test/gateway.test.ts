// File path: ./test/gateway.test.ts
import assert from "assert";
import fs from "fs";

async function runIntegrationTests() {
  console.log("Initializing RyanAI gateway integration checks...");
  
  const indexHtmlExists = fs.existsSync("./index.html");
  assert.strictEqual(indexHtmlExists, true, "index.html must exist as the primary platform container.");

  const appTsxExists = fs.existsSync("./src/App.tsx");
  assert.strictEqual(appTsxExists, true, "App.tsx must be present for root component rendering.");

  console.log("All pipeline assertions passed successfully.");
}

runIntegrationTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});