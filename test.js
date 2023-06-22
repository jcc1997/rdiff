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
const { tmpdir } = require("os");

const cacheDir = path.join(__dirname, "tests/cache");
function ensureCacheDir() {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
}

// function syncTest(i) {
//   signature(
//     path.join(__dirname, "tests/old_file"),
//     path.join(__dirname, `tests/cache/old${i}.sig`)
//   );
//   delta(
//     path.join(__dirname, `tests/cache/old${i}.sig`),
//     path.join(__dirname, "tests/new_file"),
//     path.join(__dirname, `tests/cache/old2new${i}.delta`)
//   );
//   patch(
//     path.join(__dirname, "tests/old_file"),
//     path.join(__dirname, `tests/cache/old2new${i}.delta`),
//     path.join(__dirname, `tests/cache/new_file_from_patch${i}`)
//   );
// }

// async function asyncTest(i) {
//   await signatureAsync(
//     path.join(__dirname, "tests/old_file"),
//     path.join(__dirname, `tests/cache/old${i}.sig`)
//   );
//   await deltaAsync(
//     path.join(__dirname, `tests/cache/old${i}.sig`),
//     path.join(__dirname, "tests/new_file"),
//     path.join(__dirname, `tests/cache/old2new${i}.delta`)
//   );
//   await patchAsync(
//     path.join(__dirname, "tests/old_file"),
//     path.join(__dirname, `tests/cache/old2new${i}.delta`),
//     path.join(__dirname, `tests/cache/new_file_from_patch${i}`)
//   );
// }

async function benchMark() {
  const TIMES = 1;

  rimraf.sync(cacheDir);
  ensureCacheDir();

  // console.time("sync");
  // for (let i = 0; i < TIMES; i++) {
  //   syncTest(i);
  // }
  // console.timeEnd("sync");

  // rimraf.sync(cacheDir);
  // ensureCacheDir();

  // console.time("async");
  // await Promise.all(new Array(TIMES).fill(0).map((_, i) => asyncTest(i)));
  // console.timeEnd("async");

  // rimraf.sync(cacheDir);

}

function randomBlock(size) {
  const buffer = Buffer.alloc(size);
  for (let i = 1; i <= size; i++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
  return buffer;
}

async function benchFileSize(block_size, diff_size, range_from) {
  const tmp = tmpdir();

  const base_file_path = path.join(tmp, "rdiff-napi/base_file");
  const sig_path = path.join(tmp, "rdiff-napi/base_file.sig");
  const delta_path = path.join(tmp, "rdiff-napi/delta_file.sig");
  const new_file_path = path.join(tmp, "rdiff-napi/new_file");
  const new_new_file_path = path.join(tmp, "rdiff-napi/new_new_file");

  if (!fs.existsSync(path.join(tmp, "rdiff-napi"))) {
    fs.mkdirSync(path.join(tmp, "rdiff-napi"));
  }

  const buf = randomBlock(block_size);
  await fs.promises.writeFile(base_file_path, buf);
  randomBlock(diff_size).copy(buf, range_from, 0);
  await fs.promises.writeFile(new_file_path, buf);

  console.time("signatureAsync");
  await signatureAsync(
    base_file_path,
    sig_path,
  );
  console.timeEnd("signatureAsync");
  console.time("deltaAsync");
  await deltaAsync(
    sig_path,
    new_file_path,
    delta_path
  );
  console.timeEnd("deltaAsync");
  console.time("patchAsync");
  await patchAsync(
    base_file_path,
    delta_path,
    new_new_file_path
  );
  console.timeEnd("patchAsync");

  fs.promises.unlink(base_file_path);
  fs.promises.unlink(sig_path);
  fs.promises.unlink(delta_path);
  fs.promises.unlink(new_file_path);
  fs.promises.unlink(new_new_file_path);
}

async function main() {
  // rimraf.sync(cacheDir);
  // ensureCacheDir();

  // await signatureAsync(
  //   path.join(__dirname, "tests/old_file"),
  //   path.join(__dirname, `tests/cache/old.sig`)
  // );

  // rimraf.sync(cacheDir);

  // await benchMark();
  // sync: 6.900s
  // async: 4.651s

  // await benchFileSize(1 << 30, 1 << 25, 1000000000);

  // signatureAsync: 1.223s
  // deltaAsync: 1.396s
  // patchAsync: 1.426s
  await benchFileSize(1 << 29, 1 << 24, 500000000);

  // signatureAsync: 157.606ms
  // deltaAsync: 186.502ms
  // patchAsync: 189.405ms
  // await benchFileSize(1 << 26, 1 << 20, 60000000);
}

main();
