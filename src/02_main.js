function TIC() {
    update()
    draw()
}

function update() {
    if (state === "game") {
        updateGame()
    }
}

function draw() {
    if (state === "game") {
        drawGame()
    }
}