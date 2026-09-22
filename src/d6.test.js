import assert from "node:assert/strict";
import test from "node:test";
import {
  SPAWN_RADIUS_PX,
  d6FacePath,
  d6RollPath,
  pointAtRadius,
  randomFace,
  sameSelection,
} from "./d6.js";

function sequence(values) {
  let index = 0;
  return () => values[index++];
}

test("randomFace stays on 1 through 6", () => {
  assert.equal(randomFace(sequence([0])), 1);
  assert.equal(randomFace(sequence([0.999])), 6);
  assert.equal(randomFace(sequence([0.5])), 4);
});

test("face and roll paths use the flat and rolling filenames", () => {
  assert.equal(d6FacePath(3), "/art/d6/d6_flat/d6_white_03_flat.webp");
  assert.equal(d6RollPath(), "/art/d6/d6_roll/d6_white_rolling.webm");
});

test("spawn point sits on the 175px circle", () => {
  const center = { x: 10, y: 20 };
  const point = pointAtRadius(center, SPAWN_RADIUS_PX, sequence([0.25]));
  assert.ok(Math.abs(point.x - 10) < 1e-9);
  assert.ok(Math.abs(point.y - 195) < 1e-9);
  const distance = Math.hypot(point.x - center.x, point.y - center.y);
  assert.ok(Math.abs(distance - SPAWN_RADIUS_PX) < 1e-9);
});

test("selection compare ignores order", () => {
  assert.equal(sameSelection(["b", "a"], ["a", "b"]), true);
  assert.equal(sameSelection(["a"], []), false);
  assert.equal(sameSelection(undefined, []), true);
});
