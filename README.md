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

The extension stores the token id on the player under `com.mythic-dice/attachedTokenId`, and the chosen color under `com.mythic-dice/dieColor`. It does not set the die's `attachedTo` field. `attachedTo` would parent the die to the token and move it whenever the token moves. The die is a Prop image. It starts on the token and glides out to 175 pixels from the token's center, on a random angle, while it rotates. The glide eases to a stop at a random time before 1.5 seconds, and that is when the still face replaces the clip. Each click adds another die. There is no result notification. Colors are white, red, blue, green, and black. The blue art is the teal pigment in the files.

Clicking **Attach to Token** clears the current token and waits for the next Character-layer click, so a later press can pick a different token. If that token is deleted or leaves the Character layer, the attachment clears too.

The roll item starts as `{die}_{color}_rolling.webm` (`video/webm`). When the glide stops, the same item becomes `{die}_{color}_{NN}_flat.webp` (`image/webp`) and keeps the angle it stopped on. The face is a random number from 1 through that die's highest face.

Scene items sync to the room, so other players see the die. The image URL is this dev server. A browser on another machine cannot load `localhost`, so remote players see the item without the picture until the extension is hosted.

The white roll clip is 512×512 VP9, 8 frames, 0.334s, and has no alpha. The roll flash is an opaque square. The landed WebP is the transparent face.

A trailing character on the install link, such as `manifest.json.`, is not a file. The dev server used to answer that with the popover HTML, which Owlbear then tried to parse as JSON. Unknown paths now 404.
