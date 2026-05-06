import Module from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "../..");
const resolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    return resolveFilename.call(
      this,
      path.join(root, request.slice(2)),
      parent,
      isMain,
      options,
    );
  }
  return resolveFilename.call(this, request, parent, isMain, options);
};

export default createJiti(`${root}/`);
