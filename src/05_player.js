function movePlayer() {
    if (btn(BTN_LEFT)) player.x -= player.speed
    if (btn(BTN_RIGHT)) player.x += player.speed
    if (btn(BTN_UP)) player.y -= player.speed
    if (btn(BTN_DOWN)) player.y += player.speed

    clampPlayerToHouse()
}

function drawPlayer() {
    spr(PLAYER_SPRITE, player.x, player.y, 0)
}