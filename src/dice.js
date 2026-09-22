export const DIE_SIZE = 512;
export const SPAWN_RADIUS_PX = 175;
// Rolls land as image items. The roll clip plays, then the same item
// becomes a static face. Each click adds another die. Colors are
// white, red, blue, green, and black. The blue art is the teal
// pigment in the files.
export const ROLL_MS_MIN = 650;
export const ROLL_MS_MAX = 1450;
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

export function rollDuration(random = Math.random) {
  return ROLL_MS_MIN + random() * (ROLL_MS_MAX - ROLL_MS_MIN);
}

export function spinDegrees(random = Math.random) {
  const magnitude = 120 + random() * 240;
  return random() < 0.5 ? -magnitude : magnitude;
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
