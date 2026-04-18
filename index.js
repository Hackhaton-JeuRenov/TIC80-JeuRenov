// title:  Prairie TD - Clean Version
// script: js

// --- 1. DONNÉES ET CONFIGURATION ---
let player = {
  x: 117, y: 65,
  speed: 1, dir: 'bas', moving: false,
  argent: 100
};

// Objets avec lesquels on peut interagir
const INTERACTIVES = {
  39: { type: 'fenetre', cost: 50, label: "RENOVER FENETRES" },
  84: { type: 'fenetre', cost: 50, label: "RENOVER FENETRES" },
  60: { type: 'arbre',   cost: 10, label: "COUPER L'ARBRE", next: 0 }
};

// Remplacement précis (ID sale: ID propre)
const REPAIRS = { 39: 100, 84: 99 };

// Éléments simplement solides (murs, rochers)
const SOLIDS = [7, 22, 38];

let colliders = [];

// --- 2. FONCTIONS OUTILS (MOTEUR) ---

/** Scanne la map pour enregistrer les zones de collision */
function refreshColliders() {
  colliders = [];
  for (let y = 0; y < 17; y++) {
    for (let x = 0; x < 30; x++) {// scan toute la map
      let id = mget(x, y);// on vérifie l'ID de la tile à cette position
      
      let isAction = INTERACTIVES[id]; // vérifie si c'est une zone d'action
      let isWall   = SOLIDS.indexOf(id) !== -1; // vérifie si c'est un mur/obstacle

      if (isAction || isWall) {
        colliders.push({
          x: x * 8, y: y * 8, tx: x, ty: y,
          id: id,
          info: isAction // stocke les infos d'interaction si dispo
        });
      }
    }
  }
}

/** Vérifie si deux rectangles se touchent */
function isTouching(rect1, rect2, padding = 6) {
  return rect1.x + padding < rect2.x + 8 &&
         rect1.x + 16 - padding > rect2.x &&
         rect1.y + padding < rect2.y + 8 &&
         rect1.y + 16 - padding > rect2.y;
}

// --- 3. ACTIONS DU JEU ---

/** Rénove tous les éléments définis dans REPAIRS */
function repairAll() {
  for (let y = 0; y < 17; y++) {
    for (let x = 0; x < 30; x++) {
      let id = mget(x, y);
      if (REPAIRS[id]) mset(x, y, REPAIRS[id]);
    }
  }
}

/** Gère les inputs et l'argent lors d'une interaction */
function doAction(obj) {
  let item = obj.info;
  print(`${item.label} (${item.cost}$)`, 60, 125, 12);

  if (keyp(5) && player.argent >= item.cost) { // Touche E
    player.argent -= item.cost;
    sfx(0);

    if (item.type === 'fenetre') repairAll();
    else mset(obj.tx, obj.ty, item.next);

    refreshColliders();
  }
}

// --- 4. BOUCLE TIC-80 ---

refreshColliders();

function TIC() {
  cls();
  map(0, 0, 30, 17, 0, 0);

  // -- Mouvement & Direction --
  let dx = 0, dy = 0;
  if (btn(0)) { dy = -player.speed; player.dir = 'haut'; }
  if (btn(1)) { dy = player.speed;  player.dir = 'bas'; }
  if (btn(2)) { dx = -player.speed; player.dir = 'gauche'; }
  if (btn(3)) { dx = player.speed;  player.dir = 'droite'; }
  
  player.moving = (dx !== 0 || dy !== 0);

  // -- Collisions (Glissement sur les axes) --
  let nextX = { x: player.x + dx, y: player.y };
  let nextY = { x: player.x, y: player.y + dy };
  let hitX = false, hitY = false;
  let activeObj = null;

  for (let c of colliders) {
    if (isTouching(nextX, c)) hitX = true;
    if (isTouching(nextY, c)) hitY = true;
    // Détection interaction (marge plus large pour être à l'aise)
    if (c.info && isTouching(player, c, -2)) activeObj = c;
  }

  if (!hitX) player.x += dx;
  if (!hitY) player.y += dy;

  // -- Animation du Sprite --
  let anim = (Math.floor(time() / 150) % 2 === 0);
  let sprId = 259; // ID par défaut

  const sprites = {
    bas:    player.moving ? (anim ? 257 : 259) : 259,
    haut:   player.moving ? (anim ? 323 : 325) : 327,
    gauche: player.moving ? (anim ? 297 : 299) : 329,
    droite: player.moving ? (anim ? 295 : 293) : 331
  };
  sprId = sprites[player.dir];

  spr(sprId, player.x, player.y, 0, 1, 0, 0, 2, 2);

  // -- HUD & UI --
  if (activeObj) doAction(activeObj);
  print(`ARGENT: ${player.argent}$`, 170, 5, 11);
}