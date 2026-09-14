// File path: ./test/smoke.test.ts

import assert from "assert";
import fs from "fs";

async function runSmokeTests() {
  console.log("Executing RyanAI platform smoke tests...");

  // Verify core platform entrypoints and files
  assert.strictEqual(fs.existsSync("index.html"), true, "index.html platform container is required[cite: 3].");
  assert.strictEqual(fs.existsSync("src/main.tsx"), true, "main.tsx entrypoint is required[cite: 5].");
  assert.strictEqual(fs.existsSync("src/App.tsx"), true, "App.tsx root component is required[cite: 4].");
  assert.strictEqual(fs.existsSync("server.ts"), true, "Fastify gateway server.ts is required.");

  // Verify DOM mount structure inside index.html
  const htmlContent = fs.readFileSync("index.html", "utf-8");
  assert.strictEqual(htmlContent.includes('id="root"'), true, "Root mounting div must be present in index.html[cite: 3].");

  console.log("All platform smoke tests passed successfully.");
}

runSmokeTests().catch((err) => {
  console.error("Smoke test failure:", err);
  process.exit(1);
});