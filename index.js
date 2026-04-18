// title: Prairie TD - Merged Version
// script: js

// ======================================================
// INTRO / STORY
// ======================================================

let gameState = 'intro';
let introStartTime = -1;
let introScrollOffset = 0;
let introOnEnd = null;

const INTRO_LINES = [
	'Welcome.',
	'',
	'After years of saving',
	'(and a few questionable life choices),',
	'you are finally a homeowner.',
	'',
	'The price was... suspiciously low.',
	'',
	'The reason? This house has not',
	'been renovated in decades.',
	'And outside, the climate is no longer',
	'playing by the old rules.',
	'',
	'Freezing winters, scorching summers,',
	'violent storms... every season',
	'is ready to test your decisions.',
	'',
	"You cannot afford to fix everything.",
	'Definitely not right now.',
	'',
	'So choose wisely.',
	'',
	'Because here, every detail matters.',
	'',
	'One bad decision...',
	'and this house will happily',
	'remind you why it was so cheap.'
];

const WINTER_LINES = [
	'Winter is coming.',
	'',
	'At first, it feels almost peaceful.',
	'Quiet. Calm. Suspiciously calm.',
	'',
	'Then the storm shows up.',
	'',
	'The wind screams at your walls,',
	'snow stacks up on the roof,',
	'and the cold slips inside',
	'like it owns the place.',
	'',
	'Every weakness becomes obvious.',
	'Very obvious.',
	'',
	'Every draft feels personal.',
	'',
	'This house is not ready.',
	'',
	'Hopefully, you are.'
];

// Conserves narrative content from the first version
const WINTER1_FAIL = [
	'The storm arrives in full force.',
	'',
	'Snow piles up on the roof.',
	'More. And more.',
	'And more.',
	'',
	'That sound... was not reassuring.',
	'',
	'The roof gives in.',
	'',
	'Turns out, fixing it',
	'was not optional.'
];
const WINTER1_SUCCESS = ['The storm hits hard.', '', 'Snow piles up on the roof.', '', 'But this time...', 'it holds.', '', 'For once, something', 'goes according to plan.'];
const SUMMER1_FAIL = [
	'The heat arrives early.',
	'',
	'Then it stays.',
	'',
	'The walls trap the warmth inside.',
	'',
	'Every room becomes an oven.',
	'',
	'Breathing gets harder.',
	'Thinking gets slower.',
	'',
	'Maybe insulation mattered',
	'after all.'
];
const SUMMER1_SUCCESS = ['The heatwave settles in.', '', 'But inside...', 'it is bearable.', '', 'The walls do their job.', '', 'You are not comfortable.', '', 'But you are alive.'];
const WINTER2_FAIL = [
	'Winter returns.',
	'',
	'Colder than before.',
	'',
	'You turn on the heater.',
	'',
	'It clicks.',
	'',
	'It stops.',
	'',
	'...that is not a good sign.',
	'',
	'The cold takes its time.',
	'',
	'You do not.'
];
const FINAL_FAIL = [
	'Summer comes back.',
	'',
	'Money is gone.',
	'Completely gone.',
	'',
	'The windows are still broken.',
	'',
	'At some point,',
	'you just stop caring.',
	'',
	'Fresh air is nice.',
	'Privacy is overrated.',
	'',
	'Your neighbors disagree.',
	'Very loudly.',
	'',
	'Apparently,',
	'walking around naked',
	'was the last straw.',
	'',
	'Turns out...',
	'you can survive the weather,',
	'but not the neighborhood.',
	'',
	'And deep down,',
	'you knew it all along:',
	'you do not win',
	'the renovation game',
	'when you are broke.'
];

function startIntroScreen(lines, onEnd) {
	introScrollOffset = 0;
	introStartTime = -1;
	introOnEnd = { lines: lines, cb: onEnd };
}

function drawIntro() {
	if (introStartTime < 0) introStartTime = time();

	cls(0);

	const lineH = 9;
	const elapsed = time() - introStartTime;
	const lines = introOnEnd ? introOnEnd.lines : INTRO_LINES;

	if (btn(1)) introScrollOffset = Math.min(introScrollOffset + 1.5, lines.length * lineH);
	if (btn(0)) introScrollOffset = Math.max(introScrollOffset - 1.5, 0);

	for (let i = 0; i < lines.length; i++) {
		const y = 10 + i * lineH - introScrollOffset;
		if (y >= -lineH && y <= 136) {
			const line = lines[i];
			const x = Math.floor((240 - line.length * 6) / 2);
			print(line, x, y, 12);
		}
	}

	rect(0, 120, 240, 16, 0);
	if (Math.floor(elapsed / 750) % 2 === 0) {
		print('UP/DOWN: scroll  ENTER: go next', 36, 126, 6);
	}

	if (keyp(50)) {
		const cb = introOnEnd ? introOnEnd.cb : null;
		introOnEnd = null;
		if (cb) cb();
		else gameState = 'game';
	}
}

// ======================================================
// CONSTANTES GLOBALES
// ======================================================

const MAP_W = 30;
const MAP_H = 17;
const TILE = 8;
const SCREEN_W = 240;
const SCREEN_H = 136;

const KEY_A = 4;
const KEY_B = 5;

const SEASON_DURATION_MS = 10000;
const ENEMY_SPAWN_DELAY_MS = 3000;
const SPRING_WINDOW_BREAK_DELAY_MS = 10000;

// ======================================================
// JOUEUR / SAISON
// ======================================================

let player = {
	x: 117,
	y: 65,
	speed: 1,
	dir: 'bas',
	moving: false,
	argent: 100
};

let season = 'printemps';
let seasonStartTime = 0;
let winterLoaded = false;
let winterTransitionQueued = false;
let windowsRenovated = false;
let windowsBrokenBySpring = false;
let nextSpringWindowBreakAt = SPRING_WINDOW_BREAK_DELAY_MS;

// ======================================================
// VIE JOUEUR
// ======================================================

let hp = 100;
const MAX_HP = 100;
let prevBtn = { z: false, x: false };
let fullHpUntil = 0;

// ======================================================
// MAISON / STRUCTURES
// ======================================================

const HOUSE_TILE_ID = 31;
const HOUSE_HIT_DAMAGE = 10;

const TARGETABLE_TILES = {
	7: { type: 'mur', damageFactor: 0.35, targetBias: 1 },
	22: { type: 'mur', damageFactor: 0.35, targetBias: 1 },
	38: { type: 'mur', damageFactor: 0.35, targetBias: 1 },

	39: { type: 'fenetre_cassee', damageFactor: 0.60, targetBias: 2 },
	84: { type: 'fenetre_cassee', damageFactor: 0.60, targetBias: 2 },

	100: { type: 'fenetre_reparee', damageFactor: 0.30, targetBias: 2 },
	99: { type: 'fenetre_reparee', damageFactor: 0.30, targetBias: 2 },

	101: { type: 'porte', damageFactor: 0.85, targetBias: 3 },
	31: { type: 'maison', damageFactor: 1.15, targetBias: 4 }
};

let houseHp = 100;
const HOUSE_MAX_HP = 100;
let structures = [];
let windowsBrokenAtMinus30Done = false;

// ======================================================
// PARAMETRES DE SAISON
// ======================================================

const SEASON_SETTINGS = {
	printemps: {
		spawnDelay: 2200,
		maxTotalSpawns: 10,
		maxAlive: 3
	},
	hiver: {
		spawnDelay: 1400,
		maxTotalSpawns: 16,
		maxAlive: 5
	}
};

let spawnedBySeason = {
	printemps: 0,
	hiver: 0
};

// ======================================================
// INTERACTIONS / COLLISIONS
// ======================================================

const INTERACTIVES = {
	39: { type: 'fenetre', cost: 50, label: 'RENOVER FENETRES' },
	84: { type: 'fenetre', cost: 50, label: 'RENOVER FENETRES' },
	101: { type: 'porte', label: 'SORTIR' }
};

const SOLIDS = [7, 22, 38, 99, 100, 31];
const PASSABLE = [101];

let colliders = [];

// ======================================================
// ENNEMIS
// ======================================================

let enemies = [];
let lastSpawn = 0;

const ENEMY_TYPES = {
	coureur: {
		sprite: 359,
		w: 16,
		h: 16,
		baseSpeed: 0.55,
		baseDamage: 8,
		seasonMods: {
			printemps: { speedMul: 0.85, damageMul: 0.85 },
			hiver: { speedMul: 1.35, damageMul: 1.30 }
		}
	},
	brute: {
		sprite: 361,
		w: 16,
		h: 16,
		baseSpeed: 0.40,
		baseDamage: 12,
		seasonMods: {
			printemps: { speedMul: 1.25, damageMul: 1.20 },
			hiver: { speedMul: 0.80, damageMul: 0.85 }
		}
	}
};

// ======================================================
// OUTILS MAP / SAISON
// ======================================================

function applyPersistentMapChanges() {
	if (windowsRenovated) {
		mset(12, 5, 100);
		mset(16, 5, 100);
		mset(12, 13, 99);
		mset(17, 13, 99);
	}
}

function breakWindowsFromSpringEvent() {
	mset(12, 5, 39);
	mset(16, 5, 39);
	mset(12, 13, 84);
	mset(17, 13, 84);

	windowsRenovated = false;
	windowsBrokenBySpring = true;

	refreshColliders();
	refreshStructures();
}

function breakWindowsAtMinus30Once() {
	if (windowsBrokenAtMinus30Done) return;
	if (houseHp > -30) return;

	mset(12, 5, 55);
	mset(16, 5, 55);
	mset(12, 13, 99);
	mset(17, 13, 99);

	windowsBrokenAtMinus30Done = true;
	windowsRenovated = false;

	refreshColliders();
	refreshStructures();
}

function handleSpringWindowEvent() {
	if (season !== 'printemps') return;
	if (windowsBrokenBySpring) return;
	if (time() < nextSpringWindowBreakAt) return;

	breakWindowsFromSpringEvent();
}

function switchToWinter() {
	sync(0, 1, false);
	winterLoaded = true;
	season = 'hiver';
	seasonStartTime = time();
	lastSpawn = time();
	applyPersistentMapChanges();
	refreshColliders();
	refreshStructures();
}

// ======================================================
// SCAN MAP
// ======================================================

function refreshColliders() {
	colliders = [];

	for (let y = 0; y < MAP_H; y++) {
		for (let x = 0; x < MAP_W; x++) {
			let id = mget(x, y);

			if (PASSABLE.includes(id)) continue;

			let isAction = INTERACTIVES[id];
			let isWall = SOLIDS.includes(id);

			if (isAction || isWall) {
				colliders.push({
					x: x * TILE,
					y: y * TILE,
					tx: x,
					ty: y,
					id: id,
					info: isAction || null
				});
			}
		}
	}
}

function refreshStructures() {
	structures = [];

	for (let y = 0; y < MAP_H; y++) {
		for (let x = 0; x < MAP_W; x++) {
			let id = mget(x, y);
			let data = TARGETABLE_TILES[id];

			if (data) {
				structures.push({
					tx: x,
					ty: y,
					x: x * TILE + 4,
					y: y * TILE + 4,
					id: id,
					type: data.type,
					damageFactor: data.damageFactor,
					targetBias: data.targetBias
				});
			}
		}
	}
}

// ======================================================
// COLLISIONS
// ======================================================

function isTouching(rect1, rect2, padding = 6) {
	return rect1.x + padding < rect2.x + 8 &&
		rect1.x + 16 - padding > rect2.x &&
		rect1.y + padding < rect2.y + 8 &&
		rect1.y + 16 - padding > rect2.y;
}

// ======================================================
// ACTIONS JOUEUR
// ======================================================

function repairAll() {
	// Repare explicitement les 4 fenetres
	mset(12, 5, 39);
	mset(16, 5, 39);
	mset(12, 13, 100);
	mset(17, 13, 100);

	windowsRenovated = true;
	windowsBrokenBySpring = false;
	nextSpringWindowBreakAt = time() + SPRING_WINDOW_BREAK_DELAY_MS;

	refreshColliders();
	refreshStructures();
}

function doAction(obj) {
	let item = obj.info;
	if (!item) return;

	let label = item.cost ? `${item.label} (${item.cost}$)` : item.label;
	print(label, 60, 125, 12);

	if (item.type === 'fenetre' && keyp(KEY_B) && player.argent >= item.cost) {
		player.argent -= item.cost;
		repairAll();
	}
}

// ======================================================
// IA ENNEMIS
// ======================================================

function getNearestStructure(enemy) {
	let best = null;
	let bestScore = 999999;

	let ex = enemy.x + enemy.w / 2;
	let ey = enemy.y + enemy.h / 2;

	for (let i = 0; i < structures.length; i++) {
		let s = structures[i];
		let dx = s.x - ex;
		let dy = s.y - ey;
		let dist = Math.sqrt(dx * dx + dy * dy);
		let score = dist + (s.targetBias - 1) * 16;

		if (score < bestScore) {
			bestScore = score;
			best = s;
		}
	}

	return best;
}

function getEnemyStats(enemy) {
	let typeData = ENEMY_TYPES[enemy.type];
	let mods = typeData.seasonMods[season] || { speedMul: 1, damageMul: 1 };

	return {
		sprite: typeData.sprite,
		w: typeData.w,
		h: typeData.h,
		speed: typeData.baseSpeed * mods.speedMul,
		damage: Math.floor(typeData.baseDamage * mods.damageMul)
	};
}

function randomEnemyType() {
	if (season === 'hiver') {
		return Math.random() < 0.65 ? 'coureur' : 'brute';
	}
	return Math.random() < 0.35 ? 'coureur' : 'brute';
}

function spawnEnemy() {
	let side = Math.floor(Math.random() * 4);
	let type = randomEnemyType();
	let typeData = ENEMY_TYPES[type];

	let enemy = {
		type: type,
		x: 0,
		y: 0,
		w: typeData.w,
		h: typeData.h
	};

	if (side === 0) {
		enemy.x = -enemy.w;
		enemy.y = Math.floor(Math.random() * 120);
	} else if (side === 1) {
		enemy.x = SCREEN_W;
		enemy.y = Math.floor(Math.random() * 120);
	} else if (side === 2) {
		enemy.x = Math.floor(Math.random() * 224);
		enemy.y = -enemy.h;
	} else {
		enemy.x = Math.floor(Math.random() * 224);
		enemy.y = SCREEN_H;
	}

	enemies.push(enemy);
}

function trySpawnEnemy() {
	let settings = SEASON_SETTINGS[season];
	let elapsedInSeason = time() - seasonStartTime;

	if (elapsedInSeason < ENEMY_SPAWN_DELAY_MS) return;
	if (spawnedBySeason[season] >= settings.maxTotalSpawns) return;
	if (enemies.length >= settings.maxAlive) return;
	if (time() - lastSpawn < settings.spawnDelay) return;

	spawnEnemy();
	lastSpawn = time();
	spawnedBySeason[season]++;
}

function updateEnemies() {
	if (houseHp <= -30 || structures.length === 0) return;

	trySpawnEnemy();

	for (let i = enemies.length - 1; i >= 0; i--) {
		let e = enemies[i];
		let stats = getEnemyStats(e);
		let target = getNearestStructure(e);

		if (!target) continue;

		let ex = e.x + e.w / 2;
		let ey = e.y + e.h / 2;
		let dx = target.x - ex;
		let dy = target.y - ey;
		let dist = Math.sqrt(dx * dx + dy * dy);

		if (dist > 6) {
			e.x += (dx / dist) * stats.speed;
			e.y += (dy / dist) * stats.speed;
		} else {
			let impact = Math.max(1, Math.floor(stats.damage * target.damageFactor));

			if (target.id === HOUSE_TILE_ID) {
				impact = Math.max(impact, HOUSE_HIT_DAMAGE);
			}

			houseHp = houseHp - impact;
			breakWindowsAtMinus30Once();
			enemies.splice(i, 1);
		}
	}
}

// ======================================================
// AFFICHAGE
// ======================================================

function drawEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		let e = enemies[i];
		let stats = getEnemyStats(e);
		spr(stats.sprite, e.x, e.y, 0, 1, 0, 0, 2, 2);
	}
}

function drawHouseHp() {
	const pct = houseHp / HOUSE_MAX_HP;

	let col = 11;
	if (pct <= 0.5) col = 9;
	if (pct <= 0.25) col = 8;

	let textX = 2;
	let textY = 2;

	let barX = 40;
	let barY = 2;
	let barW = 50;
	let barH = 4;

	print('MAISON', textX, textY, 0, false, 1);

	rect(barX, barY, barW, barH, 1);
	rectb(barX, barY, barW, barH, 6);

	let w = Math.floor(pct * barW);
	if (w > 0) rect(barX, barY, w, barH, col);

	if (houseHp <= 0) {
		print('GAME OVER', 92, 62, 8, false, 2);
	}
}

// ======================================================
// HUD JOUEUR
// ======================================================

function handleHealthInput() {
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
}

// ======================================================
// INIT
// ======================================================

refreshColliders();
refreshStructures();

// ======================================================
// BOUCLE PRINCIPALE
// ======================================================

function TIC() {
	if (gameState === 'intro' || gameState === 'season_intro') {
		drawIntro();
		return;
	}

	if (seasonStartTime === 0) {
		seasonStartTime = time();
		lastSpawn = time();
		nextSpringWindowBreakAt = time() + SPRING_WINDOW_BREAK_DELAY_MS;
	}

	// Changement saison manuel (garde la fonctionnalite de la version intro)
	if (!winterLoaded && !winterTransitionQueued && btnp(7)) {
		winterTransitionQueued = true;
		gameState = 'season_intro';
		startIntroScreen(WINTER_LINES, function () {
			switchToWinter();
			gameState = 'game';
			winterTransitionQueued = false;
		});
		return;
	}

	// Changement saison automatique (garde la fonctionnalite de la clean version)
	if (!winterLoaded && !winterTransitionQueued && time() - seasonStartTime >= SEASON_DURATION_MS) {
		winterTransitionQueued = true;
		gameState = 'season_intro';
		startIntroScreen(WINTER_LINES, function () {
			switchToWinter();
			gameState = 'game';
			winterTransitionQueued = false;
		});
		return;
	}

	handleSpringWindowEvent();
	updateEnemies();

	cls();
	map(0, 0, MAP_W, MAP_H, 0, 0);
	drawEnemies();

	// MOUVEMENT JOUEUR
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

	// COLLISIONS JOUEUR
	let nextX = { x: player.x + dx, y: player.y };
	let nextY = { x: player.x, y: player.y + dy };
	let hitX = false;
	let hitY = false;
	let activeObj = null;

	for (let i = 0; i < colliders.length; i++) {
		let c = colliders[i];
		if (isTouching(nextX, c)) hitX = true;
		if (isTouching(nextY, c)) hitY = true;

		if (c.info && isTouching(player, c, -2)) {
			activeObj = c;
		}
	}

	if (!hitX) player.x += dx;
	if (!hitY) player.y += dy;

	// SPRITE JOUEUR
	let anim = (Math.floor(time() / 150) % 2 === 0);

	const sprites = {
		bas: player.moving ? (anim ? 257 : 259) : 259,
		haut: player.moving ? (anim ? 323 : 325) : 327,
		gauche: player.moving ? (anim ? 297 : 299) : 329,
		droite: player.moving ? (anim ? 295 : 293) : 365
	};

	spr(sprites[player.dir], player.x, player.y, 0, 1, 0, 0, 2, 2);

	// INTERACTIONS
	if (activeObj) doAction(activeObj);

	// HUD
	handleHealthInput();
	drawHouseHp();

	let remainingSeason = Math.max(0, Math.ceil((SEASON_DURATION_MS - (time() - seasonStartTime)) / 1000));
	let remainingSpawnDelay = Math.max(0, Math.ceil((ENEMY_SPAWN_DELAY_MS - (time() - seasonStartTime)) / 1000));

	print('ARGENT: ' + player.argent + '$', 170, 2, 0);

	if (!winterLoaded) {
		print('HIVER DANS ' + remainingSeason + 's', 95, 10, 0);
	}

	if (remainingSpawnDelay > 0) {
		print('ENNEMIS DANS ' + remainingSpawnDelay + 's', 80, 118, 0);
	}
}
