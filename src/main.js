import "./style.css";
import OBR from "@owlbear-rodeo/sdk";
import { PENDING_KEY, ROLL_KEY, SNAPSHOT_KEY, TOKEN_KEY } from "./ids.js";

const app = document.querySelector("#app");
app.innerHTML = `
  <main>
    <h1>Mythic Dice</h1>
    <p id="status">Waiting for Owlbear…</p>
    <button id="attach" type="button" disabled>Attach to Token</button>
    <p id="token-status">No token attached.</p>
    <button id="roll" type="button" disabled>Roll d6</button>
  </main>
`;

const status = document.querySelector("#status");
const tokenStatus = document.querySelector("#token-status");
const attachButton = document.querySelector("#attach");
const rollButton = document.querySelector("#roll");

function setButtons(enabled) {
  attachButton.disabled = !enabled;
  rollButton.disabled = !enabled;
}

let renderGeneration = 0;

async function render(player) {
  const generation = ++renderGeneration;
  const pending = Boolean(player.metadata?.[PENDING_KEY]);
  const tokenId = player.metadata?.[TOKEN_KEY];

  attachButton.disabled = false;
  if (pending) {
    tokenStatus.textContent = "Click a character token.";
  }

  if (!tokenId) {
    rollButton.disabled = true;
    if (!pending) tokenStatus.textContent = "No token attached.";
    return;
  }

  rollButton.disabled = false;
  let name = "token";
  if (await OBR.scene.isReady()) {
    const items = await OBR.scene.items.getItems([tokenId]);
    const token = items[0];
    if (generation !== renderGeneration) return;
    if (!token) {
      rollButton.disabled = true;
      tokenStatus.textContent = pending
        ? "Click a character token. The previous token is not on this scene."
        : "The attached token is not on this scene.";
      return;
    }
    if (token.name) name = token.name;
  }

  tokenStatus.textContent = pending
    ? `Click a character token. Still attached to ${name}.`
    : `Attached to ${name}.`;
}

attachButton.addEventListener("click", async () => {
  const selection = (await OBR.player.getSelection()) ?? [];
  await OBR.player.setMetadata({
    [PENDING_KEY]: true,
    [SNAPSHOT_KEY]: selection,
  });
  await OBR.player.deselect();
});

rollButton.addEventListener("click", async () => {
  await OBR.player.setMetadata({
    [ROLL_KEY]: { id: crypto.randomUUID(), die: "d6" },
  });
});

if (!OBR.isAvailable) {
  status.textContent =
    "Opened outside Owlbear. Add http://localhost:5173/manifest.json in your profile, enable it in a room, and open the Mythic Dice action.";
  setButtons(false);
} else {
  OBR.onReady(async () => {
    status.textContent = "Connected to Owlbear.";
    const metadata = await OBR.player.getMetadata();
    const selection = (await OBR.player.getSelection()) ?? [];
    await render({ metadata, selection });
    OBR.player.onChange(render);
  });
}
