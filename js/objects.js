let Sprite = function (sourceX,sourceY,width,height,x,y){
    this.sourceX = sourceX
    this.sourceY = sourceY
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.vx = 0
    this.vy = 0
}

    Sprite.prototype.centerX = function() {
        return this.x + (this.width / 2)
    }

    Sprite.prototype.centerY = function() {
        return this.y + (this.height / 2)
    }

    Sprite.prototype.halfWidth = function() {
        return this.width / 2
    }

    Sprite.prototype.halfHeight = function() {
        return this.height / 2
    }

let Enemies = function (sourceX,sourceY,width,height,x,y) {
    Sprite.call(this,sourceX,sourceY,width,height,x,y)
    this.normal = 1
    this.exploded = 2
    this.crazy = 3
    this.state = this.normal
    this.mvStyle = this.normal
}

    Enemies.prototype = Object.create(Sprite.prototype)

    Enemies.prototype.explode = function () {
        this.sourceX = 231
        this.width = 114
        this.height = 86
    }

let Allieds = function (sourceX,sourceY,width,height,x,y) {
    Sprite.call(this,sourceX,sourceY,width,height,x,y)
    this.normal = 1
    this.exploded = 2
    this.state = this.normal
    this.mvStyle = this.normal
}
    
    Allieds.prototype = Object.create(Sprite.prototype)
    
    Allieds.prototype.explode = function () {
        this.sourceX = 231
        this.width = 114
        this.height = 86
    }

let ObjectMessage = function (y,text,color) {
    this.x = 0
    this.y = y
    this.text = text
    this.visible = true
    this.font = 'normal bold 24px Kidspace-DEMO'
    this.fontColor = color
    this.baseline = 'top'
}