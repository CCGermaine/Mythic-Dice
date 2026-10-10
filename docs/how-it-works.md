# How it works

The popover is 280 by 500. Title, attached-token line, and color bar are centered. Six dice sit in two columns, in this order: d4, d10, d6, d12, d8, d20. Each picture is that color's highest flat face.

Colors are white, red, blue, green, and black. The choice is stored on the player as `com.mythic-dice/dieColor`. Switching color updates the popover and does not recolor dice already on the table. Blue is the teal pigment in the art.

**Attach to Token** clears the current token and waits for the next Character-layer click. The token id is `com.mythic-dice/attachedTokenId` on the player, not the die's `attachedTo`. A die is its own prop, so Owlbear's move tool can drag it, and deleting the token does not delete the die. If the token is deleted or leaves the Character layer, the attachment clears.

A click sends `com.mythic-dice/rollRequest`. The background page rolls once and clears the request. The die starts on the token as the roll clip, glides to a random point 175 pixels out, and rotates. It stops at a random time between 650ms and 1450ms, then the same item becomes a random flat face and keeps that position and angle. There is no result toast. Each click adds another die.

**Clear color dice** removes dice of the selected color that this player rolled from the attached token. The manifest cannot declare `PROP_DELETE`. The background page checks that permission at runtime and tells the player if the room does not allow the delete.

Metadata lives under `com.mythic-dice/`:

- Player: `attachedTokenId`, `dieColor`, `rollRequest`, `clearColorRequest`, `attachPending`, `attachSnapshot`
- Each die: `die` — die, face, color, phase (`rolling` or `landed`), and `ownerTokenId`
