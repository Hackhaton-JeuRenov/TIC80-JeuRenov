// title: Prairie TD - Merged Version
// script: js

// --- JOUEUR ---
let player = {
	x: 117,
	y: 65,
	speed: 1,
	dir: 'bas',
	moving: false,
	argent: 100
};

// --- SAISON / MAP ---
let season = 'printemps';
let winterLoaded = false;
let windowsRenovated = false;
let windowsBrokenBySpring = false;
const SPRING_WINDOW_BREAK_DELAY_MS = 3000;
let nextSpringEventAt = SPRING_WINDOW_BREAK_DELAY_MS;
let eventText = "";
let eventTextUntil = 0;

let brokenWin1 = 56;
let brokenWin2 = 99;

// --- VIE ---
let hp = 100;
const MAX_HP = 100;
let prevBtn = { z: false, x: false };
const KEY_A = 4;
const KEY_B = 5;
let fullHpUntil = 0;

// --- INTERACTIONS ---
const INTERACTIVES = {
	[brokenWin1]: { type: 'fenetre', cost: 50, label: "REPARER FENETRES" },
	[brokenWin2]: { type: 'fenetre', cost: 50, label: "REPARER FENETRES" },
	39: { type: 'fenetre', cost: 50, label: "RENOVER FENETRES" },
	84: { type: 'fenetre', cost: 50, label: "RENOVER FENETRES" },
	101: { type: 'porte', label: "SORTIR" }
};

const REPAIRS = { [brokenWin1]: 100, [brokenWin2]: 99 };
const SOLIDS = [7, 22, 38];
const PASSABLE = [101];

let colliders = [];

// --- OUTILS MAP / SAISON ---
function applyPersistentMapChanges() {
	trace('inApply')
	if (windowsRenovated) {
		mset(12, 5, 100);
		mset(16, 5, 100);
		mset(12, 13, 99);
		mset(17, 13, 99);
		trace('inRenovated')
	}
}

function switchToWinter() {
	trace("switchToWinter()", 12);
	sync(0, 1, false);
	winterLoaded = true;
	season = 'hiver';
	applyPersistentMapChanges();
}

function showEvent(text, duration = 3000) {
	eventText = text;
	eventTextUntil = time() + duration;
}

function breakWindowsFromSpringEvent() {

	mset(12, 5, brokenWin1);
	mset(16, 5, brokenWin1);
	mset(12, 13, brokenWin2);
	mset(17, 13, brokenWin2);
	windowsRenovated = false;
	windowsBrokenBySpring = true;
	refreshColliders();
	showEvent("Un voisin a cassé la fenêtre !");
}

function handleSpringEvents() {
	if (season !== 'printemps') return;
	if (windowsBrokenBySpring) return;
	if (time() < nextSpringEventAt) return;
	breakWindowsFromSpringEvent();
}

// --- SCAN COLLISIONS ---
function refreshColliders() {
	colliders = [];
	for (let y = 0; y < 17; y++) {
		for (let x = 0; x < 30; x++) {
			let id = mget(x, y);

			// si la tile est explicitement traversable, on l'ignore
			if (PASSABLE.includes(id)) continue;

			let isAction = INTERACTIVES[id];
			let isWall = SOLIDS.indexOf(id) !== -1;

			if (isAction || isWall) {
				colliders.push({
					x: x * 8,
					y: y * 8,
					tx: x,
					ty: y,
					id: id,
					info: isAction || null
				});
			}
		}
	}
}

// --- COLLISION RECTANGLE ---
function isTouching(rect1, rect2, padding = 6) {
	return rect1.x + padding < rect2.x + 8 &&
		rect1.x + 16 - padding > rect2.x &&
		rect1.y + padding < rect2.y + 8 &&
		rect1.y + 16 - padding > rect2.y;
}

// --- ACTIONS ---
function repairAll() {
	// Repare toujours les 4 fenetres de la maison.
	mset(12, 5, 39);
	mset(16, 5, 39);
	mset(12, 13, 100);
	mset(17, 13, 100);
	windowsRenovated = true;
	windowsBrokenBySpring = false;
	nextSpringEventAt = time() + SPRING_WINDOW_BREAK_DELAY_MS;
}

function doAction(obj) {
	let item = obj.info;
	print(`${item.label} (${item.cost}$)`, 60, 125, 12);

	if (keyp(5) && player.argent >= item.cost) {
		player.argent -= item.cost;
		sfx(0);

		if (item.type === 'fenetre') {
			repairAll();
		} else {
			mset(obj.tx, obj.ty, item.next);
		}

		refreshColliders();
	}
}

// --- VIE / HUD ---
function handle_health() {
	const btnZ = btn(KEY_A);
	const btnX = btn(KEY_B);

	if (btnZ && !prevBtn.z) {
		hp = Math.max(0, hp - 10);
	}

	if (btnX && !prevBtn.x) {
		const oldHp = hp;
		hp = Math.min(MAX_HP, hp + 10);

		if (oldHp < MAX_HP && hp === MAX_HP) {
			fullHpUntil = time() + 3000;
		}
	}

	prevBtn.z = btnZ;
	prevBtn.x = btnX;

	const pct = hp / MAX_HP;
	let col = 11;
	if (pct <= 0.5) col = 9;
	if (pct <= 0.25) col = 8;

	rect(2, 2, 40, 4, 1);
	rectb(2, 2, 40, 4, 6);

	const w = Math.floor(pct * 40);
	if (w > 0) rect(2, 2, w, 4, col);

	print("HP:" + hp, 44, 2, 0, false, 1);

	if (hp === 0) {
		print("DEAD!", 100, 62, 0, false, 2);
	} else if (hp === MAX_HP && time() < fullHpUntil) {
		print("FULL HP!", 92, 62, 0, false, 2);
	}
}

// --- INIT ---
refreshColliders();

// --- BOUCLE PRINCIPALE ---
function TIC() {
	// Changement saison manuel
	if (!winterLoaded && btnp(7)) {
		switchToWinter();
	}

	cls();
	map(0, 0, 30, 17, 0, 0);
	handleSpringEvents();

	// --- MOUVEMENT ---
	let dx = 0;
	let dy = 0;

	if (btn(0)) {
		dy = -player.speed;
		player.dir = 'haut';
	}
	if (btn(1)) {
		dy = player.speed;
		player.dir = 'bas';
	}
	if (btn(2)) {
		dx = -player.speed;
		player.dir = 'gauche';
	}
	if (btn(3)) {
		dx = player.speed;
		player.dir = 'droite';
	}

	player.moving = (dx !== 0 || dy !== 0);

	// --- COLLISIONS ---
	let nextX = { x: player.x + dx, y: player.y };
	let nextY = { x: player.x, y: player.y + dy };
	let hitX = false;
	let hitY = false;
	let activeObj = null;

	for (let c of colliders) {
		if (isTouching(nextX, c)) hitX = true;
		if (isTouching(nextY, c)) hitY = true;

		if (c.info && isTouching(player, c, -2)) {
			activeObj = c;
		}
	}

	if (!hitX) player.x += dx;
	if (!hitY) player.y += dy;

	// --- SPRITE ---
	let anim = (Math.floor(time() / 150) % 2 === 0);

	const sprites = {
		bas: player.moving ? (anim ? 257 : 259) : 259,
		haut: player.moving ? (anim ? 323 : 325) : 327,
		gauche: player.moving ? (anim ? 297 : 299) : 329,
		droite: player.moving ? (anim ? 295 : 293) : 331
	};

	spr(sprites[player.dir], player.x, player.y, 0, 1, 0, 0, 2, 2);

	// --- INTERACTION ---
	if (activeObj) doAction(activeObj);

	// --- HUD ---
	handle_health();
	print(`ARGENT: ${player.argent}$`, 170, 2, 0);

	if (time() < eventTextUntil) {
		print(eventText, 45, 116, 8, false, 1);
	}
}
