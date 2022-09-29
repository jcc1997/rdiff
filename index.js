const { signature, delta, patch } = require("./build/Release/rdiff.node");
const path = require("path");
signature(
  path.join(__dirname, "tests/old_file"),
  path.join(__dirname, "tests/cache/old.sig")
);
delta(
  path.join(__dirname, "tests/cache/old.sig"),
  path.join(__dirname, "tests/new_file"),
  path.join(__dirname, "tests/cache/old2new.delta")
);
patch(
  path.join(__dirname, "tests/old_file"),
  path.join(__dirname, "tests/cache/old2new.delta"),
  path.join(__dirname, "tests/cache/new_file_from_patch")
);
