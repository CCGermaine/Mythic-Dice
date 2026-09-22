export const EXTENSION_ID = "com.mythic-dice";

export function pluginKey(name) {
  return `${EXTENSION_ID}/${name}`;
}

export const TOKEN_KEY = pluginKey("attachedTokenId");
export const PENDING_KEY = pluginKey("attachPending");
export const SNAPSHOT_KEY = pluginKey("attachSnapshot");
export const ROLL_KEY = pluginKey("rollRequest");
export const DIE_KEY = pluginKey("die");
export const COLOR_KEY = pluginKey("dieColor");
