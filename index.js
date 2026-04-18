// title:  TIC-80 JS Simple Test
// author: Rob Loach
// desc:   Small example of using tic80-js
// script: js

let t = 0;
let x = 96;
let y = 24;
let world = 'WORLD!';

// MAP
const MAP_HEIGHT = 136;
const MAP_WIDTH = 240;

// HOUSE
const GAP = 10;
const BORDER = 2;

const HOUSE_X = GAP;
const HOUSE_Y = GAP;
const HOUSE_WIDTH = 240 - GAP * 2;
const HOUSE_HEIGHT = 136 - GAP * 2;
const HOUSE_BORDER_THICK = 3;

const left = HOUSE_X + HOUSE_BORDER_THICK;
const right = HOUSE_X + HOUSE_WIDTH - HOUSE_BORDER_THICK;
const top = HOUSE_Y + HOUSE_BORDER_THICK;
const bottom = HOUSE_Y + HOUSE_HEIGHT - HOUSE_BORDER_THICK;

function TIC() {
	if (btn(0)) y--;
	if (btn(1)) y++;
	if (btn(2)) x--;
	if (btn(3)) x++;

	const PLAYER_SIZE = 16;

	if (x < left) x = left;
	if (x > right - PLAYER_SIZE) x = right - PLAYER_SIZE;
	if (y < top) y = top;
	if (y > bottom - PLAYER_SIZE) y = bottom - PLAYER_SIZE;

	cls(13);

	rect(HOUSE_X, HOUSE_Y, HOUSE_WIDTH, BORDER, 0); // haut
	rect(HOUSE_X, HOUSE_Y + HOUSE_HEIGHT - BORDER, HOUSE_WIDTH, BORDER, 0); // bas
	rect(HOUSE_X, HOUSE_Y, BORDER, HOUSE_HEIGHT, 0); // gauche
	rect(HOUSE_X + HOUSE_WIDTH - BORDER, HOUSE_Y, BORDER, HOUSE_HEIGHT, 0); // droite

	spr(1 + (((t % 60) / 30) | 0) * 2, x, y, 14, 1, 0, 0, 2, 2);

	print('CACA2 ' + world, 84, 84);
	t++;
}
