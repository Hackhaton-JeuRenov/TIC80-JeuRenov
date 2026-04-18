// title: Prairie TD - Merged Version
// script: js

// --- INTRO ---
let gameState = 'intro';
let introStartTime = -1;
let introScrollOffset = 0;

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
	"You can't afford to fix everything.",
	'Definitely not right now.',
	'',
	'So choose wisely.',
	'',
	'Because here, every detail matters.',
	'',
	'One bad decision...',
	'and this house will happily',
	'remind you why it was so cheap.',
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
	'Hopefully, you are.',
];

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
	'was not optional.',
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
	'after all.',
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
	'You do not.',
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
	'you don’t win',
	'the renovation game',
	'when you’re broke.',
];

let introOnEnd = null;

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

	// Prompt clignotant en bas
	rect(0, 120, 240, 16, 0);
	if (Math.floor(elapsed / 750) % 2 === 0) {
		print('UP/DOWN: scroll  ENTER: go next', 36, 126, 6);
	}

	if (keyp(50)) {
		const cb = introOnEnd ? introOnEnd.cb : null;
		introOnEnd = null;
		if (cb) cb();
		else gameState = 'game';
		return;
	}
}

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

// --- VIE ---
let hp = 100;
const MAX_HP = 100;
let prevBtn = { z: false, x: false };
const KEY_A = 4;
const KEY_B = 5;
let fullHpUntil = 0;

// --- INTERACTIONS ---
const INTERACTIVES = {
	39: { type: 'fenetre', cost: 50, label: "RENOVER FENETRES" },
	84: { type: 'fenetre', cost: 50, label: "RENOVER FENETRES" },
	101: { type: 'porte', label: "SORTIR" }
};

const REPAIRS = { 100: 84, 39: 55 };
const SOLIDS = [7, 22, 38];
const PASSABLE = [101];

let colliders = [];

// --- OUTILS MAP / SAISON ---
function applyPersistentMapChanges() {
	trace('inApply')
	if (windowsRenovated) {
		mset(12, 5, 55);
		mset(16, 5, 55);
		mset(12, 13, 84);
		mset(17, 13, 84);
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
	for (let y = 0; y < 17; y++) {
		for (let x = 0; x < 30; x++) {
			let id = mget(x, y);
			if (REPAIRS[id]) {
				mset(x, y, REPAIRS[id]);
			}
		}
	}
	windowsRenovated = true;
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
	//INTRO TEXTE
	if (gameState === 'intro' || gameState === 'season_intro') {
		drawIntro();
		return;
	}

	// Changement saison manuel
	if (!winterLoaded && btnp(7)) {
		gameState = 'season_intro';
		startIntroScreen(WINTER_LINES, () => {
			switchToWinter();
			gameState = 'game';
		});
	}

	cls();
	map(0, 0, 30, 17, 0, 0);

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
}