function collide(sprite1,sprite2) {

    let hit = false

    //calcular a distancia entre o centro dos sprites
    let vetX = sprite1.centerX() - sprite2.centerX()
    let vetY = sprite1.centerY() - sprite2.centerY()

    //armazenar as somas das metades dos sprites na largura e na altura
    let sumHalfWidth = sprite1.halfWidth() + sprite2.halfWidth()
    let sumHalfHeight = sprite1.halfHeight() + sprite2.halfHeight()

    //verifica se houve colisão
    if (Math.abs(vetX) < sumHalfWidth && Math.abs(vetY) < sumHalfHeight) {
        hit = true
    }

    return hit
}