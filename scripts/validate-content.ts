import {
  allValidatedEntities,
  getValidationReport,
  validationPublicIndex,
} from "../src/lib/content/validation-runtime.ts";
import { validatePublicAssetRegistry } from "../src/lib/assets/public-asset-validation.ts";

const report = getValidationReport();
const assets = validatePublicAssetRegistry();

console.log("Content validation report");
console.log(`- entities: ${report.entityCount}`);
console.log(`- public entities: ${report.publicCount}`);
console.log(`- discoverable entities: ${report.discoverableCount}`);
console.log(`- unique slugs: ${report.slugCount}`);
console.log(`- relations: ${report.relationCount}`);
console.log(`- public index entries: ${validationPublicIndex.length}`);
console.log(`- public assets: ${assets.length}`);
console.log(`- validated entity ids: ${allValidatedEntities.map((entity) => entity.id).join(", ")}`);
