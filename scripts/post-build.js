import { writeFileSync } from "node:fs";


// create a package.json in the CJS build to override the root "type": "module"
// this ensures Node treats the CJS files as CommonJS
writeFileSync(
  "dist/cjs/package.json",
  JSON.stringify({ type: "commonjs" }, null, 2)
);
