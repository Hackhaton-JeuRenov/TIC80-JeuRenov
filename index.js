// title:  Tower Defense Prairie - Renovation
// script: js

let player = {
	x: 90,
	y: 90,
	speed: 1,
	dir: 'bas',
	moving: false,
	argent: 100,
}

let season = 'printemps'
let winterLoaded = false
let windowsRenovated = false

function applyPersistentMapChanges() {
	if (windowsRenovated) {
		mset(12, 5, 100)
		mset(16, 5, 100)
		mset(12, 13, 99)
		mset(17, 13, 99)
	}
}

function switchToWinter() {
	trace("switchToWinter()", 12)
	sync(0, 1, false)
	winterLoaded = true
	season = 'hiver'
	applyPersistentMapChanges()
}

// On définit les objets avec une fonction d'interaction
let tree = {
	x: 60,
	y: 60,
	interact: () => {
		print('COUPE: -10$', 80, 115, 12);
		if (btnp(4)) {
			// Touche E
			if (player.argent >= 10) player.argent -= 10;
		}
	},
};

let windows = {
	x: 88, // (012:005 -> 12*8)
	y: 30, // (5*8)
	interact: () => {
		print('RENOVER LA FENETRE (E): 50$', 80, 115, 12);
		if (keyp(5)) {
			// btnp = Appui unique sur E
			if (player.argent >= 50) {
				player.argent -= 50;
				// ON CHANGE LE TILE !
				// mset(tx, ty, id_du_nouveau_tile)
				mset(12, 5, 100);
				mset(16, 5, 100);
				mset(12, 13, 99);
				mset(17, 13, 99);
			}
		}
	},
};

const colliders = [tree, windows];

// Fonctions de collision
function isBlocking(a, b) {
	return a.x < b.x + 8 && a.x + 1 > b.x && a.y < b.y + 8 && a.y + 8 > b.y;
}

function isNear(a, b) {
	let gap = 1;
	return a.x < b.x + 8 + gap && a.x + 16 > b.x - gap && a.y < b.y + 8 + gap && a.y + 16 > b.y - gap;
}

function TIC() {
	// switch manuel avec btnp(4)
	if (!winterLoaded && btnp(4)) {
		switchToWinter()
	}
	cls();
	map(0, 0, 30, 17, 0, 0);

	let dx = 0,
		dy = 0;
	player.moving = false;

	// 1. INPUTS
	if (btn(0)) {
		dy -= player.speed;
		player.dir = 'haut';
		player.moving = true;
	} else if (btn(1)) {
		dy += player.speed;
		player.dir = 'bas';
		player.moving = true;
	} else if (btn(2)) {
		dx -= player.speed;
		player.dir = 'gauche';
		player.moving = true;
	} else if (btn(3)) {
		dx += player.speed;
		player.dir = 'droite';
		player.moving = true;
	}

	// 2. COLLISION & MOUVEMENT
	let next = { x: player.x + dx, y: player.y + dy };
	let hit = false;
	for (let c of colliders) if (isBlocking(next, c)) hit = true;
	if (!hit) {
		player.x = next.x;
		player.y = next.y;
	}

	// 3. ANIMATION SPRITES
	let frame = Math.floor(time() / 150) % 2;
	let spriteId = 259;
	if (player.dir === 'bas')
		spriteId =
			player.moving ?
				frame == 0 ?
					257
				:	259
			:	259;
	else if (player.dir === 'haut')
		spriteId =
			player.moving ?
				frame == 0 ?
					323
				:	325
			:	327;
	else if (player.dir === 'gauche')
		spriteId =
			player.moving ?
				frame == 0 ?
					297
				:	299
			:	329;
	else if (player.dir === 'droite')
		spriteId =
			player.moving ?
				frame == 0 ?
					295
				:	293
			:	331;

	// 4. DESSIN DU JOUEUR
	spr(spriteId, player.x, player.y, 0, 1, 0, 0, 2, 2);

	// 5. INTERACTION (Touche E)
	colliders.forEach((c) => {
		if (isNear(player, c)) {
			if (c.interact) c.interact();
		}
	});

	// BARRE DE VIE
	handle_health();

	// 6. UI (Argent en haut à droite)
	print('ARGENT: ' + player.argent + '$', 170, 2, 0);
}

let hp = 100;
const MAX_HP = 100;
let prevBtn = { z: false, x: false };

const KEY_A = 4;
const KEY_B = 5;

let fullHpUntil = 0; // moment jusqu'auquel afficher FULL HP

function handle_health() {
	// --- Input ---
	const btnZ = btn(KEY_A);
	const btnX = btn(KEY_B);

	if (btnZ && !prevBtn.z) {
		hp = Math.max(0, hp - 10);
	}

	if (btnX && !prevBtn.x) {
		const oldHp = hp;
		hp = Math.min(MAX_HP, hp + 10);

		// Si on atteint le max, afficher FULL HP pendant 3 secondes
		if (oldHp < MAX_HP && hp === MAX_HP) {
			fullHpUntil = time() + 3000;
		}
	}

	prevBtn.z = btnZ;
	prevBtn.x = btnX;

	// --- HP Bar ---
	const pct = hp / MAX_HP;
	let col = 11;
	if (pct <= 0.5) col = 9;
	if (pct <= 0.25) col = 8;

	rect(2, 2, 40, 4, 1);
	rectb(2, 2, 40, 4, 6);

	const w = Math.floor(pct * 40);
	if (w > 0) rect(2, 2, w, 4, col);

	print("HP:" + hp, 44, 2, 0, false, 1);

	// --- Message état ---
	if (hp === 0) {
		print("DEAD!", 100, 62, 0, false, 2);
	} else if (hp === MAX_HP && time() < fullHpUntil) {
		print("FULL HP!", 92, 62, 0, false, 2);
	}
}
