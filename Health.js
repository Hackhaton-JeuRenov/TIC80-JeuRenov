javascript// title:  TIC-80 JS Simple Test
// author: Rob Loach
// desc:   Small example of using tic80-js
// script: js

let hp = 100;
const MAX_HP = 100;
let prevBtn = {z: false, x: false};

const KEY_A = 4;
const KEY_B = 5;

function handle_health(){
    // --- Input ---
    const btnZ = btn(KEY_A); // Z = prendre des dégâts
    const btnX = btn(KEY_B); // X = se soigner

    if (btnZ && !prevBtn.z) {
        hp = Math.max(0, hp - 10);
    }
    if (btnX && !prevBtn.x) {
        hp = Math.min(MAX_HP, hp + 10);
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

    print("HP:" + hp, 44, 2, 7, false, 1);

    // --- Instructions ---
    print("Z: -10 HP", 2, 120, 6, false, 1);
    print("X: +10 HP", 2, 127, 11, false, 1);

    // --- Message état ---
    if (hp === 0) {
        print("DEAD!", 100, 62, 8, false, 2);
    } else if (hp === MAX_HP) {
        print("FULL HP!", 92, 62, 11, false, 2);
    }
}