import { validateCartographyCandidateFiles, validateContinentShapes } from "../src/lib/cartography/validation.ts";

async function main() {
  const shapes = validateContinentShapes();
  const files = await validateCartographyCandidateFiles();

  console.log(
    JSON.stringify(
      {
        shapes,
        files,
      },
      null,
      2,
    ),
  );
}

await main();
