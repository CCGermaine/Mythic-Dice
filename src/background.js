import OBR, { buildImage } from "@owlbear-rodeo/sdk";
import {
  DIE_SIZE,
  D6_COLOR,
  ROLL_MS,
  SPAWN_RADIUS_PX,
  absoluteUrl,
  d6FacePath,
  d6RollPath,
  pointAtRadius,
  randomFace,
  sameSelection,
} from "./d6.js";
import {
  DIE_KEY,
  PENDING_KEY,
  ROLL_KEY,
  SNAPSHOT_KEY,
  TOKEN_KEY,
} from "./ids.js";

const handledRolls = new Set();
let clearingTokenId = null;

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

async function rollD6(tokenId) {
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

  const face = randomFace();
  const position = pointAtRadius(token.position, SPAWN_RADIUS_PX);
  const origin = window.location.origin;
  const rollUrl = absoluteUrl(d6RollPath(D6_COLOR), origin);
  const faceUrl = absoluteUrl(d6FacePath(face, D6_COLOR), origin);

  const item = buildImage(imageContent(rollUrl, "video/webm"), grid())
    .name(`d6 ${face}`)
    .description(`d6 showing ${face}`)
    .layer("PROP")
    .position(position)
    .metadata({
      [DIE_KEY]: {
        die: "d6",
        face,
        color: D6_COLOR,
        phase: "rolling",
        ownerTokenId: tokenId,
      },
    })
    .build();

  await OBR.scene.items.addItems([item]);

  await new Promise((resolve) => {
    window.setTimeout(resolve, ROLL_MS);
  });

  await OBR.scene.items.updateItems([item.id], (items) => {
    for (const draft of items) {
      draft.image.url = faceUrl;
      draft.image.mime = "image/webp";
      draft.metadata[DIE_KEY].phase = "landed";
    }
  });

  OBR.notification.show(`Rolled d6: ${face}`);
}

async function rollFromRequest(player) {
  const request = player.metadata[ROLL_KEY];
  if (!request?.id || handledRolls.has(request.id)) return;
  handledRolls.add(request.id);
  const tokenId = player.metadata[TOKEN_KEY];
  await OBR.player.setMetadata({ [ROLL_KEY]: null });
  try {
    await rollD6(tokenId);
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

OBR.onReady(() => {
  OBR.player.onChange((player) => {
    attachFromSelection(player);
    rollFromRequest(player);
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
