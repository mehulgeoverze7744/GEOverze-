import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  containSize,
  drawingBufferSize,
  LOGICAL_ASPECT,
  MAX_DPR,
  normalizeClientPoint,
} from "./canvasCoords.ts";

describe("normalizeClientPoint", () => {
  const rect = { left: 100, top: 50, width: 400, height: 250 };

  it("maps the top-left corner to 0,0", () => {
    assert.deepEqual(normalizeClientPoint(100, 50, rect), { x: 0, y: 0 });
  });

  it("maps the center independently of CSS pixel size", () => {
    assert.deepEqual(normalizeClientPoint(300, 175, rect), { x: 0.5, y: 0.5 });
  });

  it("clamps points outside the canvas", () => {
    assert.deepEqual(normalizeClientPoint(0, 0, rect), { x: 0, y: 0 });
    assert.deepEqual(normalizeClientPoint(900, 900, rect), { x: 1, y: 1 });
  });

  it("returns null for a zero-size rect", () => {
    assert.equal(normalizeClientPoint(10, 10, { left: 0, top: 0, width: 0, height: 10 }), null);
  });
});

describe("containSize", () => {
  it("letterboxes a 16:10 surface inside a wide box", () => {
    const { w, h } = containSize(1600, 600, LOGICAL_ASPECT);
    assert.ok(Math.abs(w / h - LOGICAL_ASPECT) < 1e-6);
    assert.equal(h, 600);
    assert.equal(w, 960);
  });

  it("pillarboxes a 16:10 surface inside a tall box", () => {
    const { w, h } = containSize(400, 900, LOGICAL_ASPECT);
    assert.equal(w, 400);
    assert.equal(h, 250);
  });
});

describe("drawingBufferSize", () => {
  it("scales the bitmap by devicePixelRatio", () => {
    assert.deepEqual(drawingBufferSize(400, 250, 2), { width: 800, height: 500, scale: 2 });
  });

  it("caps extreme mobile DPRs", () => {
    const sized = drawingBufferSize(400, 250, 4);
    assert.equal(sized.scale, MAX_DPR);
    assert.equal(sized.width, Math.round(400 * MAX_DPR));
  });
});
