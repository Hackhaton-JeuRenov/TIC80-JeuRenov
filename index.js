// title:  Tower Defense Prairie - Renovation
// script: js

<<<<<<< HEAD
let player = {
	x: 90,
	y: 90,
	speed: 1,
	dir: 'bas',
	moving: false,
	argent: 100,
};
=======
let x = 96;
let y = 24;
let player = { x: 90, y: 90, speed: 1 };
let tree = { x: 60, y: 60, event: () => print('Voulez-vous ajouter une fenêtre ?') };
let rock = { x: 80, y: 80, event: () => print('Voulez-vous rénover le toit ?') };

const colliders = [tree, rock];
>>>>>>> 982ee0f ([ADD] event on collider functions)

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
	return a.x < b.x + 8 && a.x + 16 > b.x && a.y < b.y + 8 && a.y + 16 > b.y;
}

<<<<<<< HEAD
function isNear(a, b) {
	let gap = 1;
	return a.x < b.x + 8 + gap && a.x + 16 > b.x - gap && a.y < b.y + 8 + gap && a.y + 16 > b.y - gap;
=======
function collidesAny(p, colliders) {
	return colliders.some((c) => collision(p, c));
>>>>>>> 982ee0f ([ADD] event on collider functions)
}

function TIC() {
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
<<<<<<< HEAD
	let hit = false;
	for (let c of colliders) if (isBlocking(next, c)) hit = true;
	if (!hit) {
=======
	if (collidesAny(next, colliders)) {
		colliders.forEach((c) => {
			if (collision(next, c) && c.event) c.event();
		});
	} else {
>>>>>>> 982ee0f ([ADD] event on collider functions)
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

	// 6. UI (Argent en haut à droite)
	print('ARGENT: ' + player.argent + '$', 170, 5, 11);

	// Debug Pos
	print('X:' + Math.floor(player.x) + ' Y:' + Math.floor(player.y), 5, 5, 12);
}
