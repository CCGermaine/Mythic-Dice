# Mythic Dice

Owlbear Rodeo extension for a Mythic Bastionland table. Dice land on the scene as image items and stay there. Owlbear's move tool drags them.

This build is the d6 slice only: attach a character token, roll, play the short roll clip, then swap that same item to a static face.

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
3. Click **Roll d6**.

The extension stores the token id on the player under `com.mythic-dice/attachedTokenId`. It does not set the die's `attachedTo` field. `attachedTo` would parent the die to the token and move it whenever the token moves. The die is a Prop image placed within 100 pixels of the token's center, on a random point inside that disk. Each roll adds another die.

The roll item starts as `d6_white_rolling.webm` (`video/webm`) and, after 450ms, the same item becomes `d6_white_NN_flat.webp` (`image/webp`). The face is a random number from 1 to 6. The color is white for this slice.

Scene items sync to the room, so other players see the die. The image URL is this dev server. A browser on another machine cannot load `localhost`, so remote players see the item without the picture until the extension is hosted.

The white roll clip is 512×512 VP9, 8 frames, 0.334s, and has no alpha. The roll flash is an opaque square. The landed WebP is the transparent face.

A trailing character on the install link, such as `manifest.json.`, is not a file. The dev server used to answer that with the popover HTML, which Owlbear then tried to parse as JSON. Unknown paths now 404.
