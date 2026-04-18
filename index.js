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

// objets interactifs
let tree = {
	x: 60,
	y: 60,
	interact: () => {
		print('COUPE: -10$', 80, 115, 12)
		if (btnp(4)) {
			if (player.argent >= 10) player.argent -= 10
		}
	},
}

let windows = {
	x: 88,
	y: 30,
	interact: () => {
		print('RENOVER LA FENETRE (E): 50$', 80, 115, 12)
		if (keyp(5)) {
			if (player.argent >= 50 && !windowsRenovated) {
				player.argent -= 50
				windowsRenovated = true
				applyPersistentMapChanges()
			}
		}
	},
}

const colliders = [tree, windows]

function isBlocking(a, b) {
	return a.x < b.x + 8 && a.x + 16 > b.x && a.y < b.y + 8 && a.y + 16 > b.y
}

function isNear(a, b) {
	let gap = 1
	return a.x < b.x + 8 + gap && a.x + 16 > b.x - gap && a.y < b.y + 8 + gap && a.y + 16 > b.y - gap
}

function TIC() {
	// switch manuel avec btnp(4)
	if (!winterLoaded && btnp(4)) {
		switchToWinter()
	}

	cls()
	map(0, 0, 30, 17, 0, 0)

	let dx = 0
	let dy = 0
	player.moving = false

	if (btn(0)) {
		dy -= player.speed
		player.dir = 'haut'
		player.moving = true
	} else if (btn(1)) {
		dy += player.speed
		player.dir = 'bas'
		player.moving = true
	} else if (btn(2)) {
		dx -= player.speed
		player.dir = 'gauche'
		player.moving = true
	} else if (btn(3)) {
		dx += player.speed
		player.dir = 'droite'
		player.moving = true
	}

	let next = { x: player.x + dx, y: player.y + dy }
	let hit = false

	for (let c of colliders) {
		if (isBlocking(next, c)) hit = true
	}

	if (!hit) {
		player.x = next.x
		player.y = next.y
	}

	let frame = Math.floor(time() / 150) % 2
	let spriteId = 259

	if (player.dir === 'bas') {
		spriteId = player.moving ? (frame === 0 ? 257 : 259) : 259
	} else if (player.dir === 'haut') {
		spriteId = player.moving ? (frame === 0 ? 323 : 325) : 327
	} else if (player.dir === 'gauche') {
		spriteId = player.moving ? (frame === 0 ? 297 : 299) : 329
	} else if (player.dir === 'droite') {
		spriteId = player.moving ? (frame === 0 ? 295 : 293) : 331
	}

	spr(spriteId, player.x, player.y, 0, 1, 0, 0, 2, 2)

	colliders.forEach((c) => {
		if (isNear(player, c)) {
			if (c.interact) c.interact()
		}
	})

	print('ARGENT: ' + player.argent + '$', 170, 5, 11)
	print('X:' + Math.floor(player.x) + ' Y:' + Math.floor(player.y), 5, 5, 12)

	print('T=' + Math.floor(time() / 1000) + 's', 5, 13, 12)
	print('SAISON=' + season, 5, 21, winterLoaded ? 12 : 11)
	print('BTN4 = switch hiver', 5, 29, 12)
}