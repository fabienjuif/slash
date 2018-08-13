# Slash, the game
This is a fast game, it can be player in like 10s per life.
The goal is to be multiplayer.

## Commands
 - `npm install`
 - `npm start`
 - go to [http://localhost:3000](http://localhost:3000)

## Keys
Default keys are
 - Arrows
 - `c` to **jump and slash**
 - `v` to **shield**

## Game (currently goal)
 - 5 players maximum (aim 2 for now), with _100HP_ each
 - Each player is a human (aim for 1 human + 1 AI for now)
 - You can move arround
 - You can **JUMP AND SLASH** in a given direction (where you look at) to kill your enemy, it does _50_ damage, meaning you can kill someone with two slashes
 - You can **shield** you, by doing so you loose _1HP_ per seconds
 - World is proceduraly created
 - **later ?** add some items (but a few, like 1 or 2 -> HP pot / power boost / cooldown boost)
 - **later ?** add the ability to build wall
 - **later ?** add the ability to break walls

## Librairies
 - physics engine: [matter-js](https://github.com/liabru/matter-js)
 - graphical engine: [pixi-js](http://www.pixijs.com/)
