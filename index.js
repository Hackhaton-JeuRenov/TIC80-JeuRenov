// title: Prairie TD - Renovation Demo
// script: js

// ======================================================
// INTRO / STORY
// ======================================================

let gameState = 'intro';
let introStartTime = -1;
let introScrollOffset = 0;
let introOnEnd = null;

const INTRO_LINES = [
	'Bienvenue.',
	'',
	'Tu viens d\'acheter une maison.',
	'Le prix etait tres bas.',
	'',
	'La raison est simple:',
	'la maison est en mauvais etat,',
	'et les saisons sont devenues extremes.',
	'',
	'Tu ne peux pas tout renover tout de suite.',
	'Il faudra choisir les bons travaux.',
	'',
	'Objectif de la demo:',
	'- Se deplacer',
	'- Renover',
	'- Passer les saisons',
	'- Survivre'
];

const WINTER1_LINES = [
	'Hiver 1 arrive.',
	'',
	'Mega neige annoncee.',
	'',
	'Si le toit n\'est pas renove:',
	'effondrement immediat.'
];

const INTERSEASON_LINES = [
	'Inter-saison.',
	'',
	'La tempete est passee.',
	'',
	'Tu peux retravailler',
	'et finir des renovations',
	'avant le prochain hiver.'
];

const WINTER2_LINES = [
	'Hiver 2 arrive.',
	'',
	'Anomalies climatiques:',
	'- Vague de chaleur',
	'- Retour du gel',
	'',
	'La maison doit tenir.'
];

const WINTER1_FAIL_LINES = [
	'Mega neige.',
	'Le toit cede.',
	'',
	'GAME OVER',
	'Toit non renove.'
];

const HEAT_FAIL_LINES = [
	'Anomalie: vague de chaleur.',
	'La maison est mal isolee.',
	'',
	'GAME OVER',
	'Secheresse / chaleur.'
];

const BOILER_FAIL_LINES = [
	'Anomalie: retour du froid.',
	'La chaudiere tombe en panne.',
	'',
	'GAME OVER',
	'Gel de la maison.'
];

const HOUSE_FAIL_LINES = [
	'La maison a trop subi.',
	'Structure detruite.',
	'',
	'GAME OVER'
];

const VICTORY_LINES = [
	'Les saisons extremes sont passees.',
	'',
	'La maison tient bon.',
	'',
	'VICTOIRE',
	'Prototype de renovation valide.'
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
		print('FLECHES H/B: defiler  ENTREE: continuer', 16, 126, 6);
	}

	if (keyp(50)) {
		const cb = introOnEnd ? introOnEnd.cb : null;
		introOnEnd = null;
		if (cb) cb();
		else gameState = 'game';
	}
}

function drawGameOverScreen() {
	cls(0);

	// Ecriture GAME OVER (sprite demande: id 452)
	spr(GAMEOVER_TEXT_SPRITE_ID, 108, 34, 0, 1, 0, 0, 3, 1);
	print('GAME OVER', 72, 22, 8, false, 2);

	// Joueur couche sur fond noir
	spr(GAMEOVER_PLAYER_LYING_SPRITE_ID, 104, 64, 0, 1, 0, 0, 2, 2);

	// Message de cause court (optionnel)
	if (gameOverReasonLines.length > 0) {
		print(gameOverReasonLines[0], 6, 106, 6);
	}

	if (Math.floor((time() - gameOverStartTime) / 600) % 2 === 0) {
		print('ENTREE: recommencer', 72, 122, 12);
	}

	if (keyp(50)) {
		resetRun();
		gameState = 'game';
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

// TIC-80 gamepad: A=4, B=5 (sur clavier AZERTY: Z et X)
const KEY_A = 4;
const KEY_B = 5;
const KEYBOARD_X = 24;
const KEYBOARD_Z = 26;

const PHASE = {
	ETE1: 'ete1',
	HIVER1: 'hiver1',
	INTERSAISON: 'intersaison',
	HIVER2: 'hiver2'
};

const PHASE_LABELS = {
	ete1: 'ETE 1',
	hiver1: 'HIVER 1',
	intersaison: 'INTERSAISON',
	hiver2: 'HIVER 2'
};

const PHASE_DURATION_MS = 30000;
const WINTER1_CHECK_DELAY_MS = PHASE_DURATION_MS;
const WINTER2_HEAT_DELAY_MS = 2800;
const WINTER2_BOILER_DELAY_MS = 6000;
const RENOVATION_HEAL_HP = 10;
const WINTER1_EVENT_DAMAGE = 10;
const WINTER2_HEAT_EVENT_DAMAGE = 12;
const WINTER2_BOILER_EVENT_DAMAGE = 10;

// ======================================================
// JOUEUR / SAISON / PHASES
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

let phase = PHASE.ETE1;
let phaseStartTime = 0;
let queuedPhase = null;
let queuedPhaseAt = 0;

let didWinter1Check = false;
let didWinter2HeatCheck = false;
let didWinter2BoilerCheck = false;

let workCollectedInPhase = false;

let interactionMessage = '';
let interactionColor = 12;
let eventMessage = '';
let eventColor = 12;
let eventUntil = 0;
let gameOverReasonLines = [];
let gameOverStartTime = 0;

const GAMEOVER_TEXT_SPRITE_ID = 452;
const GAMEOVER_PLAYER_LYING_SPRITE_ID = 452;

// ======================================================
// MAISON / RENOVATIONS
// ======================================================

const HOUSE_TILE_ID = 31;
const HOUSE_HIT_DAMAGE = 8;
const HOUSE_MAX_HP = 100;
let houseHp = HOUSE_MAX_HP;

const renovationDefs = {
	windows: {
		label: 'FENETRES',
		cost: 50,
		description: 'Isolation des fenetres',
		failNote: 'Risque chaleur en hiver2'
	},
	boiler: {
		label: 'CHAUDIERE',
		cost: 50,
		description: 'Evite la panne de chauffage',
		failNote: 'Panne + gel en hiver2'
	},
	roof: {
		label: 'TOIT',
		cost: 90,
		description: 'Supporte la mega neige',
		failNote: 'Effondrement en hiver1'
	},
	wall: {
		label: 'MUR',
		cost: 90,
		description: 'Isolation thermique',
		failNote: 'Risque chaleur en hiver2'
	}
};

let renovations = {
	windows: false,
	boiler: false,
	roof: false,
	wall: false
};

const WINDOW_TILES = [
	{ tx: 12, ty: 5, broken: 39, repaired: 100 },
	{ tx: 16, ty: 5, broken: 39, repaired: 100 },
	{ tx: 12, ty: 13, broken: 84, repaired: 99 },
	{ tx: 17, ty: 13, broken: 84, repaired: 99 }
];

const RENOVATION_ZONES = {
	roof: { x: 112, y: 20, w: 16, h: 16 },
	wall: { x: 112, y: 72, w: 16, h: 16 },
	boiler: { x: 149, y: 89, w: 16, h: 16 }
};

// Marqueurs 8x8 pour les zones de renovation (sans rectangles).
// Tu peux ajuster `boiler` si tu veux un autre sprite 8x8 de ta sheet.
const RENOVATION_ZONE_ICONS = {
	roof: 31,
	wall: 38,
	boiler: 0
};

// ======================================================
// STRUCTURES CIBLABLES (pression visuelle simple)
// ======================================================

const TARGETABLE_TILES = {
	7: { type: 'mur', damageFactor: 0.35, targetBias: 1 },
	22: { type: 'mur', damageFactor: 0.35, targetBias: 1 },
	38: { type: 'mur', damageFactor: 0.35, targetBias: 1 },
	39: { type: 'fenetre_cassee', damageFactor: 0.60, targetBias: 2 },
	84: { type: 'fenetre_cassee', damageFactor: 0.60, targetBias: 2 },
	100: { type: 'fenetre_reparee', damageFactor: 0.25, targetBias: 2 },
	99: { type: 'fenetre_reparee', damageFactor: 0.25, targetBias: 2 },
	101: { type: 'porte', damageFactor: 0.80, targetBias: 3 },
	31: { type: 'maison', damageFactor: 1.10, targetBias: 4 }
};

let structures = [];

// ======================================================
// INTERACTIONS / COLLISIONS
// ======================================================

const INTERACTIVES = {
	39: { type: 'fenetre', cost: 50, label: 'RENOVER FENETRES' },
	84: { type: 'fenetre', cost: 50, label: 'RENOVER FENETRES' },
	101: { type: 'porte', label: 'PORTE (TRAVERSABLE)' }
};

const SOLIDS = [7, 22, 38, 99, 100, 31];
const PASSABLE = [101];

let colliders = [];

// ======================================================
// ENNEMIS (garde simple, secondaire)
// ======================================================

let enemies = [];
let lastSpawn = 0;

const SEASON_SETTINGS = {
	printemps: {
		spawnDelay: 2600,
		maxTotalSpawns: 8,
		maxAlive: 2
	},
	hiver: {
		spawnDelay: 1500,
		maxTotalSpawns: 14,
		maxAlive: 4
	}
};

let spawnedBySeason = {
	printemps: 0,
	hiver: 0
};

const ENEMY_TYPES = {
	coureur: {
		sprite: 359,
		w: 16,
		h: 16,
		baseSpeed: 0.55,
		baseDamage: 12,
		seasonMods: {
			printemps: { speedMul: 0.80, damageMul: 0.75 },
			hiver: { speedMul: 1.35, damageMul: 1.20 }
		}
	},
	brute: {
		sprite: 361,
		w: 16,
		h: 16,
		baseSpeed: 0.40,
		baseDamage: 18,
		seasonMods: {
			printemps: { speedMul: 1.15, damageMul: 1.00 },
			hiver: { speedMul: 0.90, damageMul: 0.95 }
		}
	}
};

// Sprites saisonniers des "voisins"/PNJ menacants:
// - ete (map printemps): feu
// - hiver: tornade
const SEASON_THREAT_SPRITES = {
	printemps: 457,
	hiver: 331
};

// ======================================================
// OUTILS MAP / SAISON
// ======================================================

function applyPersistentMapChanges() {
	for (let i = 0; i < WINDOW_TILES.length; i++) {
		let w = WINDOW_TILES[i];
		mset(w.tx, w.ty, renovations.windows ? w.repaired : w.broken);
	}
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

function switchToSummer() {
	sync(0, 0, false);
	winterLoaded = false;
	season = 'printemps';
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
// OUTILS DIVERS
// ======================================================

function isTouching(rect1, rect2, padding = 6) {
	return rect1.x + padding < rect2.x + 8 &&
		rect1.x + 16 - padding > rect2.x &&
		rect1.y + padding < rect2.y + 8 &&
		rect1.y + 16 - padding > rect2.y;
}

function isPhaseWorkEnabled() {
	return phase === PHASE.ETE1 || phase === PHASE.INTERSAISON;
}

function canRenovateNow() {
	return phase === PHASE.ETE1 || phase === PHASE.INTERSAISON;
}

function isRenovatePressed() {
	return btnp(KEY_B) || keyp(KEYBOARD_X) || key(KEYBOARD_X);
}

function isWorkPressed() {
	return btnp(KEY_A) || keyp(KEYBOARD_Z) || key(KEYBOARD_Z);
}

function showInteraction(msg, color = 12) {
	interactionMessage = msg;
	interactionColor = color;
}

function showEvent(msg, ms = 2500, color = 12) {
	eventMessage = msg;
	eventColor = color;
	eventUntil = time() + ms;
}

function queuePhaseSwitch(nextPhase, delayMs) {
	queuedPhase = nextPhase;
	queuedPhaseAt = time() + delayMs;
}

function formatOk(flag) {
	return flag ? 'OK' : 'NON';
}

function getPhaseRemainingSeconds() {
	let leftMs = Math.max(0, PHASE_DURATION_MS - (time() - phaseStartTime));
	return Math.ceil(leftMs / 1000);
}

function applyEventDamage(amount) {
	houseHp = Math.max(0, houseHp - amount);
	if (houseHp <= 0) {
		triggerGameOver(HOUSE_FAIL_LINES);
		return true;
	}
	return false;
}

function getRenovationDefenseMultiplier() {
	// Plus la maison est renovee, plus les degats recus baissent.
	let reduction = 0;
	if (renovations.windows) reduction += 0.12;
	if (renovations.boiler) reduction += 0.08;
	if (renovations.roof) reduction += 0.17;
	if (renovations.wall) reduction += 0.23;

	return Math.max(0.35, 1 - reduction);
}

// ======================================================
// ACTIONS JOUEUR / RENOVATIONS
// ======================================================

function payAndRenovate(key) {
	if (!canRenovateNow()) {
		showInteraction('Renovations indisponibles pendant cet evenement.', 8);
		return;
	}

	let def = renovationDefs[key];
	if (!def) return;

	if (renovations[key]) {
		showInteraction(def.label + ': deja renove.', 11);
		return;
	}

	if (player.argent < def.cost) {
		showInteraction('Pas assez d\'argent pour ' + def.label + '.', 8);
		return;
	}

	player.argent -= def.cost;
	renovations[key] = true;
	houseHp = Math.min(HOUSE_MAX_HP, houseHp + RENOVATION_HEAL_HP);

	if (key === 'windows') {
		applyPersistentMapChanges();
		refreshColliders();
		refreshStructures();
	}

	showEvent(def.label + ' renove: -' + def.cost + '$  +10PV maison', 1900, 11);
}

function doAction(obj) {
	let item = obj.info;
	if (!item) return;

	if (item.type === 'fenetre') {
		if (renovations.windows) {
			showInteraction('FENETRES: DEJA RENOVEES', 11);
		} else {
			showInteraction('X: RENOVER FENETRES (50$)', 12);
		}

		if (isRenovatePressed()) {
			payAndRenovate('windows');
		}
		return;
	}

	if (item.type === 'porte') {
		showInteraction('Porte: passage libre', 6);
	}
}

function getNearbyRenovationZoneKey() {
	let cx = player.x + 8;
	let cy = player.y + 8;

	for (let key in RENOVATION_ZONES) {
		let z = RENOVATION_ZONES[key];
		if (cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h) {
			return key;
		}
	}
	return null;
}

function doZoneRenovationAction(zoneKey) {
	let def = renovationDefs[zoneKey];
	if (!def) return;

	if (renovations[zoneKey]) {
		showInteraction(def.label + ': DEJA RENOVE', 11);
		return;
	}

	if (!canRenovateNow()) {
		showInteraction('Renovations indisponibles pendant cette phase', 8);
		return;
	}

	showInteraction('X: RENOVER ' + def.label + ' (' + def.cost + '$)', 12);

	if (isRenovatePressed()) {
		payAndRenovate(zoneKey);
	}
}

function tryWorkAction() {
	if (!isPhaseWorkEnabled() || workCollectedInPhase) return;
	if (!isWorkPressed()) return;

	player.argent += 100;
	workCollectedInPhase = true;
	showEvent('Petits boulots: +100$', 2200, 10);
}

// ======================================================
// IA ENNEMIS (pression simple)
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
	let seasonalSprite = SEASON_THREAT_SPRITES[season];

	return {
		sprite: seasonalSprite !== undefined ? seasonalSprite : typeData.sprite,
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
	if (!settings) return;

	if (spawnedBySeason[season] >= settings.maxTotalSpawns) return;
	if (enemies.length >= settings.maxAlive) return;
	if (time() - lastSpawn < settings.spawnDelay) return;

	spawnEnemy();
	lastSpawn = time();
	spawnedBySeason[season]++;
}

function updateEnemies() {
	// En ete, les ennemis sont faibles et secondaires.
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
			let baseImpact = Math.max(1, Math.floor(stats.damage * target.damageFactor));
			if (target.id === HOUSE_TILE_ID) baseImpact = Math.max(baseImpact, HOUSE_HIT_DAMAGE);

			let defenseMul = getRenovationDefenseMultiplier();
			let impact = Math.max(1, Math.floor(baseImpact * defenseMul));

			houseHp = Math.max(0, houseHp - impact);
			enemies.splice(i, 1);
		}
	}
}

function drawEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		let e = enemies[i];
		let stats = getEnemyStats(e);
		spr(stats.sprite, e.x, e.y, 0, 1, 0, 0, 2, 2);
	}
}

// ======================================================
// PHASES / EVENEMENTS NARRATIFS
// ======================================================

function beginPhase(newPhase) {
	phase = newPhase;
	phaseStartTime = time();
	seasonStartTime = time();
	lastSpawn = time();
	queuedPhase = null;
	queuedPhaseAt = 0;

	if (newPhase === PHASE.ETE1 || newPhase === PHASE.INTERSAISON) {
		switchToSummer();
		workCollectedInPhase = false;
	} else {
		switchToWinter();
		workCollectedInPhase = true;
	}

	if (newPhase === PHASE.HIVER1) {
		didWinter1Check = false;
		showEvent('Mega neige en approche...', 2200, 12);
	}

	if (newPhase === PHASE.HIVER2) {
		didWinter2HeatCheck = false;
		didWinter2BoilerCheck = false;
		showEvent('Anomalies climatiques detectees.', 2200, 9);
	}
}

function resetRun() {
	player.x = 117;
	player.y = 65;
	player.speed = 1;
	player.dir = 'bas';
	player.moving = false;
	player.argent = 100;

	houseHp = HOUSE_MAX_HP;
	renovations.windows = false;
	renovations.boiler = false;
	renovations.roof = false;
	renovations.wall = false;

	enemies = [];
	spawnedBySeason.printemps = 0;
	spawnedBySeason.hiver = 0;

	season = 'printemps';
	seasonStartTime = 0;
	winterLoaded = false;
	winterTransitionQueued = false;

	phase = PHASE.ETE1;
	phaseStartTime = 0;
	queuedPhase = null;
	queuedPhaseAt = 0;
	didWinter1Check = false;
	didWinter2HeatCheck = false;
	didWinter2BoilerCheck = false;
	workCollectedInPhase = false;

	interactionMessage = '';
	eventMessage = '';
	eventUntil = 0;
	gameOverReasonLines = [];
	gameOverStartTime = 0;

	switchToSummer();
	beginPhase(PHASE.ETE1);
}

function triggerNarrativeEnd(lines) {
	gameState = 'season_intro';
	startIntroScreen(lines, function () {
		resetRun();
		gameState = 'game';
	});
}

function triggerGameOver(lines) {
	gameOverReasonLines = lines || [];
	gameOverStartTime = time();
	gameState = 'game_over';
}

function triggerVictory() {
	triggerNarrativeEnd(VICTORY_LINES);
}

function runQueuedPhaseIfNeeded() {
	if (!queuedPhase) return;
	if (time() < queuedPhaseAt) return;

	let next = queuedPhase;
	queuedPhase = null;

	if (next === PHASE.INTERSAISON) {
		gameState = 'season_intro';
		startIntroScreen(INTERSEASON_LINES, function () {
			beginPhase(PHASE.INTERSAISON);
			gameState = 'game';
		});
		return;
	}

	if (next === PHASE.HIVER1) {
		gameState = 'season_intro';
		startIntroScreen(WINTER1_LINES, function () {
			beginPhase(PHASE.HIVER1);
			gameState = 'game';
		});
		return;
	}

	if (next === PHASE.HIVER2) {
		gameState = 'season_intro';
		startIntroScreen(WINTER2_LINES, function () {
			beginPhase(PHASE.HIVER2);
			gameState = 'game';
		});
	}
}

function updatePhaseLogic() {
	runQueuedPhaseIfNeeded();
	if (gameState !== 'game') return;

	// Maison detruite par la pression ennemie -> echec simple.
	if (houseHp <= 0) {
		triggerGameOver(HOUSE_FAIL_LINES);
		return;
	}

	let elapsed = time() - phaseStartTime;

	if (phase === PHASE.ETE1) {
		if (elapsed >= PHASE_DURATION_MS) {
			queuePhaseSwitch(PHASE.HIVER1, 0);
		}
		return;
	}

	if (phase === PHASE.HIVER1) {
		if (!didWinter1Check && elapsed >= WINTER1_CHECK_DELAY_MS) {
			didWinter1Check = true;

			if (!renovations.roof) {
				triggerGameOver(WINTER1_FAIL_LINES);
				return;
			}

			if (applyEventDamage(WINTER1_EVENT_DAMAGE)) return;
			player.argent += 50;
			showEvent('Toit OK mais tempete forte: -' + WINTER1_EVENT_DAMAGE + ' PV, bonus +50$', 2800, 11);
			queuePhaseSwitch(PHASE.INTERSAISON, 0);
		}
		return;
	}

	if (phase === PHASE.INTERSAISON) {
		if (elapsed >= PHASE_DURATION_MS) {
			queuePhaseSwitch(PHASE.HIVER2, 0);
		}
		return;
	}

	if (phase === PHASE.HIVER2) {
		if (!didWinter2HeatCheck && elapsed >= WINTER2_HEAT_DELAY_MS) {
			didWinter2HeatCheck = true;
			const wellIsolated = renovations.wall && renovations.windows;

			if (!wellIsolated) {
				triggerGameOver(HEAT_FAIL_LINES);
				return;
			}

			if (applyEventDamage(WINTER2_HEAT_EVENT_DAMAGE)) return;
			showEvent('Event chaleur: maison affaiblie -' + WINTER2_HEAT_EVENT_DAMAGE + ' PV.', 2400, 10);
		}

		if (didWinter2HeatCheck && !didWinter2BoilerCheck && elapsed >= WINTER2_BOILER_DELAY_MS) {
			didWinter2BoilerCheck = true;

			if (!renovations.boiler) {
				triggerGameOver(BOILER_FAIL_LINES);
				return;
			}

			if (applyEventDamage(WINTER2_BOILER_EVENT_DAMAGE)) return;
			showEvent('Event chaudiere: pression froide -' + WINTER2_BOILER_EVENT_DAMAGE + ' PV.', 2200, 11);
		}

		if (didWinter2HeatCheck && didWinter2BoilerCheck && elapsed >= PHASE_DURATION_MS) {
			triggerVictory();
		}
	}
}

// ======================================================
// RENDU
// ======================================================

function drawWeatherOverlay() {
	if (phase !== PHASE.HIVER1 && phase !== PHASE.HIVER2) return;

	// Petits flocons pour rendre la saison lisible en demo.
	for (let i = 0; i < 16; i++) {
		let sx = (time() / 8 + i * 15) % 240;
		let sy = (time() / 10 + i * 21) % 136;
		pix(Math.floor(sx), Math.floor(sy), 12);
	}
}

function drawRenovationZones() {
	// Marqueurs en sprites 8x8.
	for (let key in RENOVATION_ZONES) {
		let z = RENOVATION_ZONES[key];
		let icon = RENOVATION_ZONE_ICONS[key] || 31;
		if (icon <= 0) continue;
		let ix = z.x + Math.floor(z.w / 2) - 4;
		let iy = z.y + Math.floor(z.h / 2) - 4;
		spr(icon, ix, iy, 0, 1);
	}
}

function drawHouseDamageBar() {
	const pct = Math.max(0, Math.min(1, houseHp / HOUSE_MAX_HP));

	// Grande jauge horizontale sous la ligne de stats.
	const x = 2;
	const y = 10;
	const w = 236;
	const h = 7;

	let col = 11; // vert
	if (pct <= 0.66) col = 9; // orange
	if (pct <= 0.33) col = 8; // rouge

	rect(x, y, w, h, 1);
	rectb(x - 1, y - 1, w + 2, h + 2, 0);

	let fillW = Math.floor((w - 2) * pct);
	if (fillW > 0) {
		rect(x + 1, y + 1, fillW, h - 2, col);
	}
}

function drawTopHud() {
	// Ligne d'infos en haut
	rect(0, 0, 240, 8, 0);
	print('$' + player.argent, 2, 1, 12);
	print(PHASE_LABELS[phase], 78, 1, 12);
	print('T:' + getPhaseRemainingSeconds(), 150, 1, 10);
	print('M:' + Math.floor(houseHp), 202, 1, 12);

	drawHouseDamageBar();
}

function drawRenovationHud() {
	rect(0, 120, 240, 8, 0);
	print('F:' + formatOk(renovations.windows), 2, 121, renovations.windows ? 11 : 8);
	print('C:' + formatOk(renovations.boiler), 58, 121, renovations.boiler ? 11 : 8);
	print('T:' + formatOk(renovations.roof), 114, 121, renovations.roof ? 11 : 8);
	print('M:' + formatOk(renovations.wall), 170, 121, renovations.wall ? 11 : 8);
}

function drawMessageBar() {
	rect(0, 128, 240, 8, 0);

	let msg = '';
	let col = 6;

	if (eventMessage && time() < eventUntil) {
		msg = eventMessage;
		col = eventColor;
	} else {
		if (time() >= eventUntil) eventMessage = '';

		if (interactionMessage) {
			msg = interactionMessage;
			col = interactionColor;
		} else if (phase === PHASE.ETE1 || phase === PHASE.INTERSAISON) {
			msg = workCollectedInPhase ? 'X:renover' : 'Z:+100$  X:renover';
		} else {
			msg = 'Survis aux evenements climatiques';
		}
	}

	print(msg, 2, 129, col);
}

// ======================================================
// BOUCLE PRINCIPALE
// ======================================================

function TIC() {
	if (gameState === 'intro' || gameState === 'season_intro') {
		drawIntro();
		return;
	}
	if (gameState === 'game_over') {
		drawGameOverScreen();
		return;
	}

	interactionMessage = '';
	interactionColor = 12;

	updatePhaseLogic();
	if (gameState !== 'game') return;

	updateEnemies();

	cls();
	map(0, 0, MAP_W, MAP_H, 0, 0);
	drawRenovationZones();
	drawEnemies();
	drawWeatherOverlay();

	// --------------------------------------------------
	// MOUVEMENT JOUEUR
	// --------------------------------------------------

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

	player.moving = dx !== 0 || dy !== 0;

	// --------------------------------------------------
	// COLLISIONS
	// --------------------------------------------------

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

	// --------------------------------------------------
	// SPRITE JOUEUR (IDs demandes conserves)
	// --------------------------------------------------

	let anim = Math.floor(time() / 150) % 2 === 0;
	const sprites = {
		bas: player.moving ? (anim ? 257 : 259) : 259,
		haut: player.moving ? (anim ? 323 : 325) : 327,
		gauche: player.moving ? (anim ? 297 : 299) : 329,
		droite: player.moving ? (anim ? 295 : 293) : 365
	};

	spr(sprites[player.dir], player.x, player.y, 0, 1, 0, 0, 2, 2);

	// --------------------------------------------------
	// INTERACTIONS
	// --------------------------------------------------

	let zoneKey = getNearbyRenovationZoneKey();
	if (zoneKey) {
		doZoneRenovationAction(zoneKey);
	} else if (activeObj) {
		doAction(activeObj);
	}

	if (!zoneKey && !activeObj && isPhaseWorkEnabled() && !workCollectedInPhase) {
		showInteraction('Z: PETITS BOULOTS (+100$)', 10);
	}

	tryWorkAction();

	// --------------------------------------------------
	// HUD
	// --------------------------------------------------

	drawTopHud();
	drawRenovationHud();
	drawMessageBar();
}

// ======================================================
// INIT
// ======================================================

refreshColliders();
refreshStructures();
resetRun();
