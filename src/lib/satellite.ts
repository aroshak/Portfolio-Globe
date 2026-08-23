// Pure-JS re-export shim for satellite.js.
//
// We import directly from satellite.js's pure-JS dist files (io/propagation/
// transforms) rather than the package barrel. The package barrel is pure JS
// too, but Vite's optimizer also pulls in the optional WASM build via the
// package's #wasm-* subpath imports, which fails to bundle in a worker
// (top-level await + node:worker_threads). This shim keeps the worker's
// dependency graph pure-JS only.
export { twoline2satrec, json2satrec } from "satellite.js/dist/io.js";
export { propagate, sgp4, gstime } from "satellite.js/dist/propagation.js";
export {
  radiansToDegrees,
  degreesToRadians,
  degreesLat,
  degreesLong,
  radiansLat,
  radiansLong,
  geodeticToEcf,
  eciToGeodetic,
  eciToEcf,
  ecfToEci,
  ecfToLookAngles,
} from "satellite.js/dist/transforms.js";
