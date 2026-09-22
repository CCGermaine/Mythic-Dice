import OBR, { buildImage } from "@owlbear-rodeo/sdk";
import {
  DIE_SIZE,
  SPAWN_RADIUS_PX,
  absoluteUrl,
  colorById,
  dieById,
  facePath,
  randomFace,
  rollDuration,
  rollPath,
  sameSelection,
  spinDegrees,
} from "./dice.js";
import {
  DIE_KEY,
  PENDING_KEY,
  ROLL_KEY,
  SNAPSHOT_KEY,
  TOKEN_KEY,
  CLEAR_COLOR_KEY,
} from "./ids.js";

const handledRolls = new Set();
let clearingTokenId = null;
let lastTokenId = null;
let rollCount = 0;

function nextSpawnPoint(tokenId, tokenPos) {
  if (tokenId !== lastTokenId) {
    lastTokenId = tokenId;
    rollCount = 0;
  }
  const index = rollCount;
  rollCount++;
  const ring = Math.floor(index / 8);
  const ringRadius = SPAWN_RADIUS_PX + ring * 125;
  const jitterDeg = Math.max(8, 20 - ring * 4);
  const slotAngle = ((index % 8) / 8) * Math.PI * 2;
  const jitterRad = (Math.random() - 0.5) * (jitterDeg / 180 * Math.PI);
  const angle = slotAngle + jitterRad;
  return {
    x: tokenPos.x + Math.cos(angle) * ringRadius,
    y: tokenPos.y + Math.sin(angle) * ringRadius,
  };
}

function imageContent(url, mime) {
  return {
    width: DIE_SIZE,
    height: DIE_SIZE,
    url,
    mime,
  };
}

function grid() {
  return {
    dpi: DIE_SIZE,
    offset: { x: DIE_SIZE / 2, y: DIE_SIZE / 2 },
  };
}

async function attachFromSelection(player) {
  if (!player.metadata[PENDING_KEY]) return;
  if (!(await OBR.scene.isReady())) return;

  const selection = player.selection ?? [];
  const blocked = player.metadata[SNAPSHOT_KEY] ?? [];
  if (sameSelection(selection, blocked)) return;
  if (selection.length === 0) {
    if (blocked.length !== 0) {
      await OBR.player.setMetadata({ [SNAPSHOT_KEY]: [] });
    }
    return;
  }

  const items = await OBR.scene.items.getItems(selection);
  const token = items.find((item) => item.layer === "CHARACTER");
  if (!token) return;

  clearingTokenId = null;
  await OBR.player.setMetadata({
    [TOKEN_KEY]: token.id,
    [PENDING_KEY]: false,
    [SNAPSHOT_KEY]: [],
  });
  const name = token.name || "token";
  OBR.notification.show(`Attached to ${name}`);
}

async function rollDie(tokenId, dieId, colorId) {
  const spec = dieById(dieId);
  const color = colorById(colorId);
  if (!spec || !color) {
    OBR.notification.show("That die or color is not in this set.");
    return;
  }
  if (!tokenId) {
    OBR.notification.show("Attach a character token first.");
    return;
  }
  if (!(await OBR.scene.isReady())) {
    OBR.notification.show("Open a scene before rolling.");
    return;
  }
  if (!(await OBR.player.hasPermission("PROP_CREATE"))) {
    OBR.notification.show("This room does not allow creating props.");
    return;
  }

  const [token] = await OBR.scene.items.getItems([tokenId]);
  if (!token) {
    await OBR.player.setMetadata({ [TOKEN_KEY]: null });
    OBR.notification.show("The attached token is not on this scene.");
    return;
  }

  const face = randomFace(spec.sides);
  const to = nextSpawnPoint(tokenId, token.position);
  const duration = rollDuration();
  const spin = spinDegrees();
  const origin = window.location.origin;
  const rollUrl = absoluteUrl(rollPath(spec.id, color.id), origin);
  const faceUrl = absoluteUrl(facePath(spec.id, face, color.id), origin);

  const item = buildImage(imageContent(rollUrl, "video/webm"), grid())
    .name(`${spec.id} ${face}`)
    .description(`${color.label} ${spec.id} showing ${face}`)
    .layer("PROP")
    .position(to)
    .rotation(spin)
    .metadata({
      [DIE_KEY]: {
        die: spec.id,
        face,
        color: color.id,
        phase: "rolling",
        ownerTokenId: tokenId,
      },
    })
    .build();

  await OBR.scene.items.addItems([item]);

  await new Promise((resolve) => setTimeout(resolve, duration));

  await OBR.scene.items.updateItems([item.id], (items) => {
    for (const draft of items) {
      draft.image.url = faceUrl;
      draft.image.mime = "image/webp";
      draft.metadata[DIE_KEY].phase = "landed";
    }
  });
}

async function rollFromRequest(player) {
  const request = player.metadata[ROLL_KEY];
  if (!request?.id || handledRolls.has(request.id)) return;
  handledRolls.add(request.id);
  const tokenId = player.metadata[TOKEN_KEY];
  const dieId = request.die;
  const colorId = request.color;
  await OBR.player.setMetadata({ [ROLL_KEY]: null });
  try {
    await rollDie(tokenId, dieId, colorId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Roll failed.";
    OBR.notification.show(message);
  }
}

async function detachIfTokenMissing() {
  const metadata = await OBR.player.getMetadata();
  const tokenId = metadata[TOKEN_KEY];
  if (!tokenId || clearingTokenId === tokenId) return;
  if (!(await OBR.scene.isReady())) return;

  const items = await OBR.scene.items.getItems([tokenId]);
  const token = items[0];
  if (token && token.layer === "CHARACTER") return;

  clearingTokenId = tokenId;
  const latest = await OBR.player.getMetadata();
  if (latest[TOKEN_KEY] !== tokenId) return;
  await OBR.player.setMetadata({ [TOKEN_KEY]: null });
  OBR.notification.show("Attached token was removed.");
}

async function clearColorFromRequest(player) {
  const colorId = player.metadata[CLEAR_COLOR_KEY];
  if (!colorId) return;
  await OBR.player.setMetadata({ [CLEAR_COLOR_KEY]: null });
  try {
    if (!(await OBR.scene.isReady())) return;
    if (!(await OBR.player.hasPermission("PROP_DELETE"))) {
      OBR.notification.show("This room does not allow deleting props.");
      return;
    }
    const tokenId = player.metadata[TOKEN_KEY];
    const allItems = await OBR.scene.items.getItems();
    const idsToDelete = allItems
      .filter((item) => item.layer === "PROP")
      .filter((item) => {
        const die = item.metadata?.[DIE_KEY];
        return die?.color === colorId && die?.ownerTokenId === tokenId;
      })
      .map((item) => item.id);
    if (idsToDelete.length === 0) {
      OBR.notification.show("No dice of that color on this token.");
      return;
    }
    await OBR.scene.items.deleteItems(idsToDelete);
    OBR.notification.show(`Removed ${idsToDelete.length} die${idsToDelete.length === 1 ? "" : "s"}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Clear failed.";
    OBR.notification.show(message);
  }
}

OBR.onReady(() => {
  OBR.player.onChange((player) => {
    attachFromSelection(player);
    rollFromRequest(player);
    clearColorFromRequest(player);
  });

  let watchingScene = false;
  const watchScene = () => {
    if (watchingScene) return;
    watchingScene = true;
    OBR.scene.items.onChange(() => {
      detachIfTokenMissing();
    });
    detachIfTokenMissing();
  };

  OBR.scene.isReady().then((ready) => {
    if (ready) watchScene();
  });
  OBR.scene.onReadyChange((ready) => {
    if (ready) watchScene();
  });
});
