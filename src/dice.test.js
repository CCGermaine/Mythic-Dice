import assert from "node:assert/strict";
import test from "node:test";
import {
  ROLL_MS_MAX,
  ROLL_MS_MIN,
  SPAWN_RADIUS_PX,
  facePath,
  glideSample,
  pointAtRadius,
  previewPath,
  randomFace,
  rollDuration,
  rollPath,
  sameSelection,
  spinDegrees,
} from "./dice.js";

function sequence(values) {
  let index = 0;
  return () => values[index++];
}

test("randomFace stays inside the die's sides", () => {
  assert.equal(randomFace(6, sequence([0])), 1);
  assert.equal(randomFace(6, sequence([0.999])), 6);
  assert.equal(randomFace(20, sequence([0.999])), 20);
  assert.equal(randomFace(4, sequence([0.5])), 3);
});

test("paths use the flat preview, rolled face, and rolling clip", () => {
  assert.equal(previewPath("d8", "red"), "/art/d8/d8_flat/d8_red_08_flat.webp");
  assert.equal(previewPath("d10", "blue"), "/art/d10/d10_flat/d10_blue_10_flat.webp");
  assert.equal(previewPath("d20", "black"), "/art/d20/d20_flat/d20_black_20_flat.webp");
  assert.equal(facePath("d12", 7, "green"), "/art/d12/d12_flat/d12_green_07_flat.webp");
  assert.equal(rollPath("d4", "white"), "/art/d4/d4_roll/d4_white_rolling.webm");
});

test("spawn point sits on the 175px circle", () => {
  const center = { x: 10, y: 20 };
  const point = pointAtRadius(center, SPAWN_RADIUS_PX, sequence([0.25]));
  assert.ok(Math.abs(point.x - 10) < 1e-9);
  assert.ok(Math.abs(point.y - 195) < 1e-9);
  const distance = Math.hypot(point.x - center.x, point.y - center.y);
  assert.ok(Math.abs(distance - SPAWN_RADIUS_PX) < 1e-9);
});

test("glide eases out from the token and stops on the landing pose", () => {
  const from = { x: 0, y: 0 };
  const to = { x: 175, y: 0 };
  const start = glideSample(from, to, 180, 0);
  const mid = glideSample(from, to, 180, 0.5);
  const end = glideSample(from, to, 180, 1);
  assert.deepEqual(start.position, from);
  assert.equal(start.rotation, 0);
  assert.ok(mid.position.x > 175 * 0.8);
  assert.ok(mid.rotation > 140);
  assert.deepEqual(end.position, to);
  assert.equal(end.rotation, 180);
});

test("roll duration stays inside the open 1.5s window", () => {
  assert.equal(rollDuration(() => 0), ROLL_MS_MIN);
  assert.ok(rollDuration(() => 0.999) < ROLL_MS_MAX + 1);
  assert.ok(rollDuration(() => 0.999) < 1500);
  const spin = spinDegrees(() => 0);
  assert.ok(spin === 120 || spin === -120);
});

test("selection compare ignores order", () => {
  assert.equal(sameSelection(["b", "a"], ["a", "b"]), true);
  assert.equal(sameSelection(["a"], []), false);
  assert.equal(sameSelection(undefined, []), true);
});
