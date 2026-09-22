# Mythic Dice

Owlbear Rodeo extension for a Mythic Bastionland table. Dice land on the scene as image items and stay there. Owlbear's move tool drags them.

Attach a character token, pick a color, then click a die. The roll clip plays, then that same item becomes a static face.

## Run

```bash
npm install
npm run dev
```

Dev server: `http://localhost:5173/`

Install link, with no extra characters after `json`:

```text
http://localhost:5173/manifest.json
```

Reload the extension after pulling this version. The manifest now includes a background page, and Owlbear keeps the previous manifest until it is refreshed.

## d6 roll

1. Open the **Mythic Dice** action.
2. Click **Attach to Token**, then click one item on the Character layer.
3. Pick a color from the swatch bar. The six dice in the popover switch to that color's highest face: d4 shows 4, d6 shows 6, d8 shows 8, d10 shows 10, d12 shows 12, and d20 shows 20.
4. Click one of those dice to roll it.

The extension stores the token id on the player under `com.mythic-dice/attachedTokenId`, and the chosen color under `com.mythic-dice/dieColor`. It does not set the die's `attachedTo` field. `attachedTo` would parent the die to the token and move it whenever the token moves. The die is a Prop image. It starts on the token and glides out to 175 pixels from the token's center, on a random angle, while it rotates. The glide eases to a stop at a random time before 1.5 seconds, and that is when the still face replaces the clip.

Clicking **Attach to Token** clears the current token and waits for the next Character-layer click, so a later press can pick a different token. If that token is deleted or leaves the Character layer, the attachment clears too.

The roll item starts as `{die}_{color}_rolling.webm` (`video/webm`). When the glide stops, the same item becomes `{die}_{color}_{NN}_flat.webp` (`image/webp`) and keeps the angle it stopped on. The face is a random number from 1 through that die's highest face.

Each click adds another die. There is no result notification. Colors are white, red, blue, green, and black. The blue art is the teal pigment in the files.

## Metadata

All keys live under the extension namespace `com.mythic-dice/`. Three are stored on the player, one on each die item, and two are transient request/snapshot keys used during attachment.

### Player metadata (set by the popover, read by the background page)

**`com.mythic-dice/attachedTokenId`** — the id of the character token the player has attached. Set when the player clicks a Character-layer item after pressing **Attach to Token**. Cleared when the token leaves the Character layer, is deleted, or the player presses **Attach to Token** again. Type: string (item id) or `null`.

**`com.mythic-dice/dieColor`** — the color selected for the next roll. Switching it in the popover immediately updates the preview dice to that color's highest flat face. Dice already on the scene keep the color they were rolled in. Type: one of `white`, `red`, `blue`, `green`, `black`.

**`com.mythic-dice/rollRequest`** — a one-shot request from the popover to the background page. Contains the die id, color id, and a unique request id. The background page reads it, rolls the die, and clears the key. Each request id is tracked in a `Set` so a duplicate never produces a second roll. Type: `{ id: string (uuid), die: string, color: string }` or `null`.

### Item metadata (set on each die prop when it is created)

**`com.mythic-dice/die`** — records what the die is, what it rolled, and what phase it is in. Lives on the die's item metadata, not the player. Type: `{ die: string, face: number, color: string, phase: "rolling" | "landed", ownerTokenId: string }`.

### Transient request/snapshot keys (used during attachment)

**`com.mythic-dice/attachPending`** — a flag telling the background page to wait for the next Character-layer selection. Set when the player presses **Attach to Token**. Type: boolean.

**`com.mythic-dice/attachSnapshot`** — a snapshot of the player's selection at the moment **Attach to Token** was pressed. The background page compares the live selection against this snapshot to decide whether the player has clicked a new item. Type: string[] (item ids).

### Where they live in the code

- Player keys: `src/ids.js` (`TOKEN_KEY`, `COLOR_KEY`, `ROLL_KEY`, `PENDING_KEY`, `SNAPSHOT_KEY`)
- Item key: `src/ids.js` (`DIE_KEY`)
- Popover set/get: `src/main.js`
- Background read/handle: `src/background.js`

Scene items sync to the room, so other players see the die. The image URL is this dev server. A browser on another machine cannot load `localhost`, so remote players see the item without the picture until the extension is hosted.

The white roll clip is 512×512 VP9, 8 frames, 0.334s, and has no alpha. The roll flash is an opaque square. The landed WebP is the transparent face.

A trailing character on the install link, such as `manifest.json.`, is not a file. The dev server used to answer that with the popover HTML, which Owlbear then tried to parse as JSON. Unknown paths now 404.
