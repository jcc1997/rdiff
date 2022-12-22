// const {
//   signature,
//   delta,
//   patch,
//   signatureAsync,
//   deltaAsync,
//   patchAsync,
// } = require("./build/Release/rdiff.node");
const {
  signature,
  delta,
  patch,
  signatureAsync,
  deltaAsync,
  patchAsync,
} = require("./prebuild/darwin-x64/rdiff.node");
const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");

const cacheDir = path.join(__dirname, "tests/cache");
function ensureCacheDir() {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
}

function syncTest(i) {
  signature(
    path.join(__dirname, "tests/old_file"),
    path.join(__dirname, `tests/cache/old${i}.sig`)
  );
  delta(
    path.join(__dirname, `tests/cache/old${i}.sig`),
    path.join(__dirname, "tests/new_file"),
    path.join(__dirname, `tests/cache/old2new${i}.delta`)
  );
  patch(
    path.join(__dirname, "tests/old_file"),
    path.join(__dirname, `tests/cache/old2new${i}.delta`),
    path.join(__dirname, `tests/cache/new_file_from_patch${i}`)
  );
}

async function asyncTest(i) {
  await signatureAsync(
    path.join(__dirname, "tests/old_file"),
    path.join(__dirname, `tests/cache/old${i}.sig`)
  );
  await deltaAsync(
    path.join(__dirname, `tests/cache/old${i}.sig`),
    path.join(__dirname, "tests/new_file"),
    path.join(__dirname, `tests/cache/old2new${i}.delta`)
  );
  await patchAsync(
    path.join(__dirname, "tests/old_file"),
    path.join(__dirname, `tests/cache/old2new${i}.delta`),
    path.join(__dirname, `tests/cache/new_file_from_patch${i}`)
  );
}

async function benchMark() {
  const TIMES = 1;

  rimraf.sync(cacheDir);
  ensureCacheDir();

  console.time("sync");
  for (let i = 0; i < TIMES; i++) {
    syncTest(i);
  }
  console.timeEnd("sync");

  rimraf.sync(cacheDir);
  ensureCacheDir();

  console.time("async");
  await Promise.all(new Array(TIMES).fill(0).map((_, i) => asyncTest(i)));
  console.timeEnd("async");

  rimraf.sync(cacheDir);
}

async function main() {
  // rimraf.sync(cacheDir);
  // ensureCacheDir();

  // await signatureAsync(
  //   path.join(__dirname, "tests/old_file"),
  //   path.join(__dirname, `tests/cache/old.sig`)
  // );

  // rimraf.sync(cacheDir);

  await benchMark();
  // sync: 6.900s
  // async: 4.651s
}

main();
