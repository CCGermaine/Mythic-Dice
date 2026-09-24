import assert from "node:assert/strict";
import test from "node:test";
import {
  ROLL_MS_MAX,
  ROLL_MS_MIN,
  SPAWN_RADIUS_PX,
  absoluteUrl,
  facePath,
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

test("absolute art URLs keep the project path", () => {
  const page = "https://ccgermaine.github.io/Mythic-Dice/background.html";
  assert.equal(
    absoluteUrl(rollPath("d4", "white"), page, "/Mythic-Dice/"),
    "https://ccgermaine.github.io/Mythic-Dice/art/d4/d4_roll/d4_white_rolling.webm",
  );
  assert.equal(
    absoluteUrl(facePath("d12", 7, "green"), page, "/Mythic-Dice/"),
    "https://ccgermaine.github.io/Mythic-Dice/art/d12/d12_flat/d12_green_07_flat.webp",
  );
  assert.equal(
    absoluteUrl(previewPath("d6", "white"), "http://localhost:5173/", "/"),
    "http://localhost:5173/art/d6/d6_flat/d6_white_06_flat.webp",
  );
  assert.equal(
    absoluteUrl("/art/d20/d20_roll/d20_white_rolling.webm", page, "/Mythic-Dice"),
    "https://ccgermaine.github.io/Mythic-Dice/art/d20/d20_roll/d20_white_rolling.webm",
  );
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
