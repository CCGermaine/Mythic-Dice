import "./style.css";
import OBR from "@owlbear-rodeo/sdk";
import {
  COLORS,
  DEFAULT_COLOR,
  POPOVER_ORDER,
  colorById,
  previewPath,
} from "./dice.js";
import {
  COLOR_KEY,
  PENDING_KEY,
  ROLL_KEY,
  SNAPSHOT_KEY,
  TOKEN_KEY,
} from "./ids.js";

const app = document.querySelector("#app");

const colorButtons = COLORS.map(
  (color) => `
    <button
      type="button"
      class="swatch"
      data-color="${color.id}"
      style="background: ${color.swatch}"
      aria-label="${color.label}"
      aria-pressed="false"
      title="${color.label}"
    ></button>
  `,
).join("");

const dieButtonsHtml = POPOVER_ORDER.map(
  (die) => `
    <button type="button" class="die" data-die="${die}" disabled>
      <img alt="${die}" width="512" height="512" />
    </button>
  `,
).join("");

app.innerHTML = `
  <main>
    <h1>Mythic Dice</h1>
    <p id="status">Waiting for Owlbear…</p>
    <button id="attach" type="button" disabled>Attach to Token</button>
    <p id="token-status">No token attached.</p>
    <div class="color-bar" role="group" aria-label="Die color">${colorButtons}</div>
    <div class="dice">${dieButtonsHtml}</div>
  </main>
`;

const status = document.querySelector("#status");
const tokenStatus = document.querySelector("#token-status");
const attachButton = document.querySelector("#attach");
const swatches = [...document.querySelectorAll(".swatch")];
const dice = [...document.querySelectorAll(".die")];

let selectedColor = DEFAULT_COLOR;
let canRoll = false;

function paintDice() {
  for (const swatch of swatches) {
    swatch.setAttribute(
      "aria-pressed",
      swatch.dataset.color === selectedColor ? "true" : "false",
    );
  }
  for (const button of dice) {
    const img = button.querySelector("img");
    img.src = previewPath(button.dataset.die, selectedColor);
    img.alt = `${selectedColor} ${button.dataset.die}`;
    button.disabled = !canRoll;
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.mode = theme.mode;
  root.style.setProperty("--bg", theme.background.paper);
  root.style.setProperty("--text", theme.text.primary);
  root.style.setProperty("--muted", theme.text.secondary);
  root.style.setProperty("--line", theme.mode === "DARK" ? "#57534e" : "#a8a29e");
}

let renderGeneration = 0;

async function render(player) {
  const generation = ++renderGeneration;
  const pending = Boolean(player.metadata?.[PENDING_KEY]);
  const tokenId = player.metadata?.[TOKEN_KEY];
  const savedColor = player.metadata?.[COLOR_KEY];
  if (colorById(savedColor) && savedColor !== selectedColor) {
    selectedColor = savedColor;
  }

  attachButton.disabled = false;
  if (pending) {
    tokenStatus.textContent = "Click a character token.";
  }

  if (!tokenId) {
    canRoll = false;
    paintDice();
    if (!pending) tokenStatus.textContent = "No token attached.";
    return;
  }

  canRoll = true;
  let name = "token";
  if (await OBR.scene.isReady()) {
    const items = await OBR.scene.items.getItems([tokenId]);
    const token = items[0];
    if (generation !== renderGeneration) return;
    if (!token) {
      canRoll = false;
      paintDice();
      tokenStatus.textContent = pending
        ? "Click a character token. The previous token is not on this scene."
        : "The attached token is not on this scene.";
      return;
    }
    if (token.name) name = token.name;
  }

  paintDice();
  tokenStatus.textContent = pending
    ? `Click a character token. Still attached to ${name}.`
    : `Attached to ${name}.`;
}

for (const swatch of swatches) {
  swatch.addEventListener("click", async () => {
    selectedColor = swatch.dataset.color;
    paintDice();
    if (OBR.isAvailable && OBR.isReady) {
      await OBR.player.setMetadata({ [COLOR_KEY]: selectedColor });
    }
  });
}

for (const button of dice) {
  button.addEventListener("click", async () => {
    if (!canRoll || !OBR.isAvailable) return;
    await OBR.player.setMetadata({
      [ROLL_KEY]: {
        id: crypto.randomUUID(),
        die: button.dataset.die,
        color: selectedColor,
      },
    });
  });
}

attachButton.addEventListener("click", async () => {
  const selection = (await OBR.player.getSelection()) ?? [];
  await OBR.player.setMetadata({
    [TOKEN_KEY]: null,
    [PENDING_KEY]: true,
    [SNAPSHOT_KEY]: selection,
  });
  await OBR.player.deselect();
});

paintDice();

if (!OBR.isAvailable) {
  status.textContent =
    "Opened outside Owlbear. Add http://localhost:5173/manifest.json in your profile, enable it in a room, and open the Mythic Dice action.";
  attachButton.disabled = true;
  canRoll = false;
  paintDice();
} else {
  OBR.onReady(async () => {
    status.textContent = "Connected to Owlbear.";
    applyTheme(await OBR.theme.getTheme());
    OBR.theme.onChange(applyTheme);
    const metadata = await OBR.player.getMetadata();
    const selection = (await OBR.player.getSelection()) ?? [];
    await render({ metadata, selection });
    OBR.player.onChange(render);
  });
}
