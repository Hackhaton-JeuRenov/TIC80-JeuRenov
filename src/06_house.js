function drawHouse() {
    drawOutside()
    drawTopWall()
    drawBottomWall()
    drawLeftWall()
    drawRightWall()
    drawInterior()
    drawCarpet()
}

function drawOutside() {
    rect(0, 0, SCREEN_W, SCREEN_H, 15)
}

function drawInterior() {
    rect(
        HOUSE_X + WALL_THICKNESS,
        HOUSE_Y + WALL_THICKNESS,
        HOUSE_W - WALL_THICKNESS * 2,
        HOUSE_H - WALL_THICKNESS * 2,
        13
    )
}

function drawTopWall() {
    const startX = HOUSE_X
    const endX = HOUSE_X + HOUSE_W

    for (let layer = 0; layer < 2; layer++) {
        const y = HOUSE_Y + layer * TILE
        const tileId = TOP_TILES[layer]

        for (let x = startX; x < endX; x += TILE) {
            spr(tileId, x, y, 0)
        }
    }
}

function drawBottomWall() {
    const startX = HOUSE_X
    const endX = HOUSE_X + HOUSE_W

    for (let layer = 0; layer < 2; layer++) {
        const y = HOUSE_Y + HOUSE_H - WALL_THICKNESS + layer * TILE
        const tileId = BOTTOM_TILES[layer]

        for (let x = startX; x < endX; x += TILE) {
            spr(tileId, x, y, 0)
        }
    }
}

function drawLeftWall() {
    const startY = HOUSE_Y
    const endY = HOUSE_Y + HOUSE_H

    for (let layer = 0; layer < 2; layer++) {
        const x = HOUSE_X + layer * TILE
        const tileId = LEFT_TILES[layer]

        for (let y = startY; y < endY; y += TILE) {
            spr(tileId, x, y, 0)
        }
    }
}

function drawRightWall() {
    const startY = HOUSE_Y
    const endY = HOUSE_Y + HOUSE_H

    for (let layer = 0; layer < 2; layer++) {
        const x = HOUSE_X + HOUSE_W - WALL_THICKNESS + layer * TILE
        const tileId = RIGHT_TILES[layer]

        for (let y = startY; y < endY; y += TILE) {
            spr(tileId, x, y, 0)
        }
    }
}

function drawCarpet() {
    const carpetWidth = 12 * TILE
    const carpetHeight = 2 * TILE

    const x = HOUSE_X + Math.floor((HOUSE_W - carpetWidth) / 2)
    const y = getHouseInnerBottom() - carpetHeight - TILE

    for (let yy = 0; yy < carpetHeight; yy += TILE) {
        for (let xx = 0; xx < carpetWidth; xx += TILE) {
            spr(CARPET_TILE, x + xx, y + yy, 0)
        }
    }
}

function getHouseInnerLeft() {
    return HOUSE_X + WALL_THICKNESS
}

function getHouseInnerRight() {
    return HOUSE_X + HOUSE_W - WALL_THICKNESS
}

function getHouseInnerTop() {
    return HOUSE_Y + WALL_THICKNESS
}

function getHouseInnerBottom() {
    return HOUSE_Y + HOUSE_H - WALL_THICKNESS
}

function clampPlayerToHouse() {
    const minX = getHouseInnerLeft()
    const maxX = getHouseInnerRight() - player.w
    const minY = getHouseInnerTop()
    const maxY = getHouseInnerBottom() - player.h

    if (player.x < minX) player.x = minX
    if (player.x > maxX) player.x = maxX
    if (player.y < minY) player.y = minY
    if (player.y > maxY) player.y = maxY
}