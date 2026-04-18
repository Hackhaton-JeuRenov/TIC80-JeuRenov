// title: TIC-80 House + Character + Dialogue
// script: js

let t = 0;
let x = 96;
let y = 24;

// ===== ECRAN =====
const SCREEN_W = 240;
const SCREEN_H = 136;
const TILE = 8;

// ===== MAISON =====
const HOUSE_X = 16;
const HOUSE_Y = 8;
const HOUSE_W = 208;
const HOUSE_H = 120;

const WALL_THICKNESS = TILE * 2;
const INSIDE_COLOR = 13;

const DRAW_INSIDE_FLOOR = true;
const INSIDE_FLOOR_ROWS = 2;

// limites de déplacement dans la maison
const left = HOUSE_X + WALL_THICKNESS;
const right = HOUSE_X + HOUSE_W - WALL_THICKNESS;
const top = HOUSE_Y + WALL_THICKNESS;
const bottom = HOUSE_Y + HOUSE_H - WALL_THICKNESS;

// ===== TUILES EXTERIEUR =====
const OUTSIDE_TILES = [2, 3, 18, 19];

// ===== CADRE EXTERIEUR =====
const OUTER_TOP_TILE    = 4;
const OUTER_BOTTOM_TILE = 4;
const OUTER_LEFT_TILE   = 4;
const OUTER_RIGHT_TILE  = 4;

const OUTER_CORNER_TL = 4;
const OUTER_CORNER_TR = 4;
const OUTER_CORNER_BL = 4;
const OUTER_CORNER_BR = 4;

// ===== CADRE INTERIEUR =====
const INNER_TOP_TILE    = 38;
const INNER_BOTTOM_TILE = 1;
const INNER_LEFT_TILE   = 102;
const INNER_RIGHT_TILE  = 54;

const INNER_CORNER_TL = 70;
const INNER_CORNER_TR = 71;
const INNER_CORNER_BL = 86;
const INNER_CORNER_BR = 87;

// ===== SOL INTERIEUR =====
const FLOOR_TILE = 20;

// ===== PERSONNAGE =====
const CHARACTER_ID_FACE_WALK1 = 257;
const CHARACTER_ID_FACE_WALK2 = 259;
const CHARACTER_ID_FACE_STAY  = 261;

const CHARACTER_ID_RIGHT_WALK1 = 293;
const CHARACTER_ID_RIGHT_WALK2 = 295;

const CHARACTER_ID_BACK_WALK1 = 323;
const CHARACTER_ID_BACK_WALK2 = 325;

const PLAYER_SIZE = 16;
const SPEED = 1;

let direction = "down";

// ===== DIALOGUE =====
let showDialogue = true;
let dialogueText = "Appuie sur E";
const KEY_E = 5;

function TIC() {
	let characterId = CHARACTER_ID_FACE_STAY;
	let flip = 0;
	let isMoving = false;

	// touche E : affiche/cache la bulle
	if (keyp(KEY_E)) {
		showDialogue = !showDialogue;
	}

	// animation de marche
	let currentFaceWalk = (Math.floor(t / 10) % 2 === 0)
		? CHARACTER_ID_FACE_WALK1
		: CHARACTER_ID_FACE_WALK2;

	let currentBackWalk = (Math.floor(t / 10) % 2 === 0)
		? CHARACTER_ID_BACK_WALK1
		: CHARACTER_ID_BACK_WALK2;

	let currentRightWalk = (Math.floor(t / 10) % 2 === 0)
		? CHARACTER_ID_RIGHT_WALK1
		: CHARACTER_ID_RIGHT_WALK2;

	// déplacements
	if (btn(0)) {
		y -= SPEED;
		direction = "up";
		isMoving = true;
	}

	if (btn(1)) {
		y += SPEED;
		direction = "down";
		isMoving = true;
	}

	if (btn(2)) {
		x -= SPEED;
		direction = "left";
		isMoving = true;
	}

	if (btn(3)) {
		x += SPEED;
		direction = "right";
		isMoving = true;
	}

	// limites
	if (x < left) x = left;
	if (x > right - PLAYER_SIZE) x = right - PLAYER_SIZE;
	if (y < top) y = top;
	if (y > bottom - PLAYER_SIZE) y = bottom - PLAYER_SIZE;

	// choix du sprite
	if (!isMoving) {
		characterId = CHARACTER_ID_FACE_STAY;
		flip = 0;
	}
	else if (direction === "down") {
		characterId = currentFaceWalk;
		flip = 0;
	}
	else if (direction === "up") {
		characterId = currentBackWalk;
		flip = 0;
	}
	else if (direction === "right") {
		characterId = currentRightWalk;
		flip = 0;
	}
	else if (direction === "left") {
		characterId = currentRightWalk;
		flip = 1;
	}

	// dessin complet
	drawHouse();

	// personnage
	spr(characterId, x, y, 0, 1, flip, 0, 2, 2);

	// dialogue au-dessus du personnage
	if (showDialogue) {
		drawDialogueBubble(x, y - 4, dialogueText);
	}

	t++;
}

function drawHouse() {
	drawOutside();
	drawOuterFrame();
	drawInnerFrame();
	drawInteriorFill();

	if (DRAW_INSIDE_FLOOR) {
		drawInsideFloor();
	}
}

function drawOutside() {
	for (let y = 0; y < SCREEN_H; y += TILE) {
		for (let x = 0; x < SCREEN_W; x += TILE) {
			const tileId = getOutsideTile(x / TILE, y / TILE);
			spr(tileId, x, y, 0);
		}
	}
}

function getOutsideTile(tx, ty) {
	const value = (tx * 17 + ty * 31 + tx * ty * 7) % 20;

	if (value < 12) return OUTSIDE_TILES[0];
	if (value < 15) return OUTSIDE_TILES[1];
	if (value < 18) return OUTSIDE_TILES[2];
	return OUTSIDE_TILES[3];
}

function drawOuterFrame() {
	drawFrameWithCorners(
		HOUSE_X,
		HOUSE_Y,
		HOUSE_W,
		HOUSE_H,
		OUTER_TOP_TILE,
		OUTER_BOTTOM_TILE,
		OUTER_LEFT_TILE,
		OUTER_RIGHT_TILE,
		OUTER_CORNER_TL,
		OUTER_CORNER_TR,
		OUTER_CORNER_BL,
		OUTER_CORNER_BR
	);
}

function drawInnerFrame() {
	drawFrameWithCorners(
		HOUSE_X + TILE,
		HOUSE_Y + TILE,
		HOUSE_W - TILE * 2,
		HOUSE_H - TILE * 2,
		INNER_TOP_TILE,
		INNER_BOTTOM_TILE,
		INNER_LEFT_TILE,
		INNER_RIGHT_TILE,
		INNER_CORNER_TL,
		INNER_CORNER_TR,
		INNER_CORNER_BL,
		INNER_CORNER_BR
	);
}

function drawFrameWithCorners(
	x, y, w, h,
	topTile, bottomTile, leftTile, rightTile,
	cornerTL, cornerTR, cornerBL, cornerBR
) {
	const tilesWide = w / TILE;
	const tilesHigh = h / TILE;

	// coins
	spr(cornerTL, x, y, 0);
	spr(cornerTR, x + w - TILE, y, 0);
	spr(cornerBL, x, y + h - TILE, 0);
	spr(cornerBR, x + w - TILE, y + h - TILE, 0);

	// haut
	for (let i = 1; i < tilesWide - 1; i++) {
		spr(topTile, x + i * TILE, y, 0);
	}

	// bas
	for (let i = 1; i < tilesWide - 1; i++) {
		spr(bottomTile, x + i * TILE, y + h - TILE, 0);
	}

	// gauche
	for (let j = 1; j < tilesHigh - 1; j++) {
		spr(leftTile, x, y + j * TILE, 0);
	}

	// droite
	for (let j = 1; j < tilesHigh - 1; j++) {
		spr(rightTile, x + w - TILE, y + j * TILE, 0);
	}
}

function drawInteriorFill() {
	rect(
		HOUSE_X + WALL_THICKNESS,
		HOUSE_Y + WALL_THICKNESS,
		HOUSE_W - WALL_THICKNESS * 2,
		HOUSE_H - WALL_THICKNESS * 2,
		INSIDE_COLOR
	);
}

function drawInsideFloor() {
	const floorX = HOUSE_X + WALL_THICKNESS;
	const floorY = HOUSE_Y + HOUSE_H - WALL_THICKNESS - INSIDE_FLOOR_ROWS * TILE;
	const floorW = HOUSE_W - WALL_THICKNESS * 2;

	for (let y = 0; y < INSIDE_FLOOR_ROWS; y++) {
		for (let x = 0; x < floorW; x += TILE) {
			spr(FLOOR_TILE, floorX + x, floorY + y * TILE, 0);
		}
	}
}

function drawDialogueBubble(px, py, text) {
	let padding = 4;
	let textWidth = print(text, -100, -100);
	let bubbleWidth = textWidth + padding * 2;
	let bubbleHeight = 12;

	let bubbleX = px + PLAYER_SIZE / 2 - bubbleWidth / 2;
	let bubbleY = py - bubbleHeight;

	if (bubbleX < 0) bubbleX = 0;
	if (bubbleX + bubbleWidth > SCREEN_W) bubbleX = SCREEN_W - bubbleWidth;
	if (bubbleY < 0) bubbleY = 0;

	rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 12);
	rectb(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 0);

	tri(
		px + PLAYER_SIZE / 2 - 2, bubbleY + bubbleHeight,
		px + PLAYER_SIZE / 2 + 2, bubbleY + bubbleHeight,
		px + PLAYER_SIZE / 2,     bubbleY + bubbleHeight + 4,
		12
	);

	print(text, bubbleX + padding, bubbleY + 2, 0);
}