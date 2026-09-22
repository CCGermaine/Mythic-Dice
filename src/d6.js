export const DIE_SIZE = 512;
export const SPAWN_RADIUS_PX = 175;
// Hold the roll clip on the scene for 1.5s, then swap to the still face.
// The file itself is 8 frames (0.334s); Owlbear keeps showing that item until we swap it.
export const ROLL_MS = 1500;
export const D6_COLOR = "white";

export function padFace(face) {
  return String(face).padStart(2, "0");
}

export function d6FacePath(face, color = D6_COLOR) {
  return `/art/d6/d6_flat/d6_${color}_${padFace(face)}_flat.webp`;
}

export function d6RollPath(color = D6_COLOR) {
  return `/art/d6/d6_roll/d6_${color}_rolling.webm`;
}

export function randomFace(random = Math.random) {
  return 1 + Math.floor(random() * 6);
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
