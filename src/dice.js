export const DIE_SIZE = 512;
export const SPAWN_RADIUS_PX = 175;
// Hold the roll clip on the scene for 1.5s, then swap to the still face.
// The file itself is short; Owlbear keeps showing that item until we swap it.
export const ROLL_MS = 1500;
export const DEFAULT_COLOR = "white";

export const DICE = [
  { id: "d4", sides: 4 },
  { id: "d6", sides: 6 },
  { id: "d8", sides: 8 },
  { id: "d10", sides: 10 },
  { id: "d12", sides: 12 },
  { id: "d20", sides: 20 },
];

// Grid order from the popover reference: two columns, top to bottom.
export const POPOVER_ORDER = ["d4", "d10", "d6", "d12", "d8", "d20"];

// Swatches are sampled from the high-face art, so the bar matches the dice.
export const COLORS = [
  { id: "white", label: "White", swatch: "#BBBBBB" },
  { id: "red", label: "Red", swatch: "#E46C6C" },
  { id: "blue", label: "Blue", swatch: "#1B9393" },
  { id: "green", label: "Green", swatch: "#1B931B" },
  { id: "black", label: "Black", swatch: "#444444" },
];

export function dieById(id) {
  return DICE.find((die) => die.id === id);
}

export function colorById(id) {
  return COLORS.find((color) => color.id === id);
}

export function padFace(face) {
  return String(face).padStart(2, "0");
}

export function facePath(die, face, color) {
  return `/art/${die}/${die}_flat/${die}_${color}_${padFace(face)}_flat.webp`;
}

export function rollPath(die, color) {
  return `/art/${die}/${die}_roll/${die}_${color}_rolling.webm`;
}

export function previewPath(die, color) {
  const spec = dieById(die);
  return facePath(die, spec.sides, color);
}

export function randomFace(sides, random = Math.random) {
  return 1 + Math.floor(random() * sides);
}

export function pointAtRadius(center, radius, random = Math.random) {
  const angle = random() * Math.PI * 2;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}

export function absoluteUrl(path, origin) {
  return new URL(path, origin).href;
}

export function sameSelection(a, b) {
  const left = [...(a ?? [])].sort();
  const right = [...(b ?? [])].sort();
  if (left.length !== right.length) return false;
  return left.every((id, index) => id === right[index]);
}
