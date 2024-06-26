(function () {
    //canvas
  let canvas = document.querySelector('canvas')
  //contexto de renderização 2d
  let context = canvas.getContext('2d')
  let payback = document.getElementById('payback')
  payback.volume = 0.1
  let ready = document.getElementById('ready')
  

  //recursos do jogo ================================================================>

  //Arrays
  let sprites = []
  let assetsToLoad = []
  let shoots = []
  let enemies = []
  let allieds = []
  let messages = []

  //variaveis uteis
  let enemiesFrequency = 100
  let enemiesTimer = 0
  let alliedFrequency = 300
  let alliedTimer = 0
  let shot = 0
  let hits = 0
  let accuracy = 0
  let scoreToWin = 50
  let fire = 0
  let explosion = 1
  let win = 2
  let lose = 3
  let dentro = 4
  let prefeitura = 5

  //sprites
  let background = new Sprite(0,87,453,696,0,0)
  sprites.push(background)

  let defender = new Sprite(153,0,45,86,200,430)
  sprites.push(defender)

  //mensagem da tela inical
  let startMessage = new ObjectMessage(canvas.height / 2,'Precione enter','#ff39ff')
  messages.push(startMessage)
  //mensagem de pause
  let pausedMessage = new ObjectMessage(canvas.height / 2,'Jogo Pausado','#ff39ff')
  pausedMessage.visible = false
  messages.push(pausedMessage)
  //mensagem de perder
  let gameOverMessage = new ObjectMessage(canvas.height / 2,'','#ff39ff')
  gameOverMessage.visible = false
  messages.push(gameOverMessage)
  //placar Tiros: ${shot} Acertos: ${hits} Mira: ${accuracy}
  let scoreMessage = new ObjectMessage(10,'','#ff39ff')
  updateScore()
  messages.push(scoreMessage)

  //imagens
  let img = new Image()
  img.addEventListener('load',loadHandler,false)
  img.src = 'img/img.png'
  assetsToLoad.push(img)

  //contador de recursos
  let loadedAssets = 0

  //entradas
  let left = 37, right = 39, enter = 13, space = 32

  //ações 
  let mvleft = mvright = shoot = spaceIsDown = false

  //estados do jogo
  let loading = 0, playing = 1, paused = 2, over = 3
  let gameState = loading

  //listeners
  window.addEventListener('keydown', (event) => {
    let key = event.keyCode
    switch (key) {
        case left:
            mvleft = true
            break;
        case right:
            mvright = true
            break;
        case space:
            if (!spaceIsDown) {
              shoot = true
              spaceIsDown = true
            }
            break
    }
  }, false)

  window.addEventListener('keyup', (event) => {
    let key = event.keyCode
    switch (key) {
        case left: 
            mvleft = false
            break;
        case right:
            mvright = false
            break;
        case enter:
            if (gameState !== over) {
              if (gameState !== playing) {
                payback.play()
                gameState = playing
                startMessage.visible = false
                pausedMessage.visible = false
              } else {
                payback.pause()
                gameState = paused
                pausedMessage.visible = true
                ready.play()
              }
            }
            break;
        case space:
            spaceIsDown = false
            break
    }
  },false)

  //funções==========================================================================>
  function loadHandler() {
    loadedAssets++
    if (loadedAssets === assetsToLoad.length) {
        img.removeEventListener('load', loadHandler, false)
        //inicia o jogo
        gameState = paused
    }
  }

  function loop() {
    requestAnimationFrame(loop, canvas)
    //define as ações com base no estado do jogo
    switch (gameState) {
        case loading:
            console.log('loading')
            break;
        case playing:
            update()
            break;
        case over:
          endGame()
          break
    }
    render()
  }

  function update() {
    //movimento carro
    //move para a esquerda
    if (mvleft && !mvright) {
      defender.vx = -5
    }
    //move para a direita
    if (mvright && !mvleft) {
      defender.vx = 5
    }
    //para o carro
    if (!mvright && !mvleft) {
      defender.vx = 0
    }

    //dispara o tiro
    if (shoot) {
      shootFire()
      shoot = false
    }
    
    //atualiza a posição do kyslan
    defender.x = Math.max(0,Math.min(canvas.width - defender.width, defender.x + defender.vx))

    //atualiza posição dos tiros
    for (let index in shoots) {
      let shoot = shoots[index]
      shoot.y += shoot.vy
      if (shoot.y < -shoot.height) {
        removeObjects(shoot,shoots)
        removeObjects(shoot,sprites)
        updateScore()
        index--
      }
    }

    //incremento enemies timer
    enemiesTimer++
    //criação do inimigo caso o timer se iguale a frequencia
    if (enemiesTimer === enemiesFrequency) {
      makeEnemies()
      enemiesTimer = 0
      //ajuste na frequencia de criaçã de inimigos
      if (enemiesFrequency > 2) {
        enemiesFrequency--
      }
    }

    //incrementa aliados timer
    alliedTimer++
    if (alliedTimer === alliedFrequency) {
      makeAllied()
      alliedTimer = 0
      //ajuste na frequencia de criaçã de inimigos
      if (alliedFrequency > 2) {
        alliedFrequency--
      }
    }

    //move os inimigos
    for (let index in enemies) {
      let enemie = enemies[index]
      if (enemie.state !== enemie.exploded) {
        enemie.y += enemie.vy
        if (enemie.state === enemie.crazy) {
          if (enemie.x > canvas.width - enemie.width || enemie.x < 0) {
            enemie.vx *= -1
          }
          enemie.x += enemie.vx
        }
      }

      //game over caso o inimigo passa
      if (enemie.y > canvas.height - enemie.height) {
        gameState = over
        playSound(prefeitura)
        setTimeout(() => {
          playSound(lose)
        }, 2000);
      }

      //confere se pegou o kyslan
      if (collide(enemie,defender)) {
        destroyEnemie(enemie)
        removeObjects(defender,sprites)
        gameState = over
        playSound(lose)
      }

      //confere se algum inimigo foi destruido
      for (let i in shoots) {
        let shoot = shoots[i]
        if (collide(shoot,enemie) && enemie.state !== enemie.exploded) {
          destroyEnemie(enemie)
          hits++
          updateScore()
          if (hits === scoreToWin) {
            playSound(win)
            gameState = over
            //destroi todos os inimigos
            for (let ind in enemies) {
              let enemiesDie = enemies[ind]
              destroyEnemie(enemiesDie)
            }
          }
          removeObjects(shoot,shoots)
          removeObjects(shoot,sprites)
          i--
          index--
        }
      }
    }

    //move os amigos
    for (let index in allieds) {
      let allied = allieds[index]
      if (allied.state !== allied.exploded) {
        allied.y += allied.vy
      }

      //amigo passa
      if (allied.y > canvas.height - allied.height) {
        playSound(dentro)
        removeObjects(allied,allieds)
        removeObjects(allied,sprites)
      }

      for (let ii in shoots) {
        let shoot = shoots[ii]
        if (collide(shoot,allied) && allied.state !== allied.exploded) {
          destroyEnemie(allied)
          removeObjects(shoot,shoots)
          removeObjects(shoot,sprites)
          playSound(lose)
          gameState = over
          ii--
          index--
        }
      }
    }
  }

  //cria os tiros
  function shootFire() {
    let bullet = new Sprite(198,0,24,24,defender.centerX() - 12,defender.y - 24)
    bullet.vy = -5
    sprites.push(bullet)
    shoots.push(bullet)
    playSound(fire)
    shot++
  }

  //criação de inimigos
  function makeEnemies() {
    //cria um valor aleatorio entre 0 e 4 => largura do canvas sobre a largura do inimigo
    //divide o canvas em 4 colunas para o posicioanmento aleatório do inimigo
    let enemiePosition = (Math.floor(Math.random() * 4.5)) * 97

    let enemie = new Enemies(0,0,97,86,enemiePosition,-86)
    enemie.vy = 1

    //otimização do inimigo
    if (Math.floor(Math.random() * 11) > 7) {
      enemie.state = enemie.crazy
      enemie.vx = 2
    }
    if (Math.floor(Math.random() * 11) > 5) {
      enemie.vy = 2
    }

    sprites.push(enemie)
    enemies.push(enemie)
  }

  function makeAllied() {
    //cria um valor aleatorio entre 0 e 4 => largura do canvas sobre a largura do inimigo
    //divide o canvas em 4 colunas para o posicioanmento aleatório do inimigo
    let alliedPosition = (Math.floor(Math.random() * 4.5)) * 97

    let allied = new Allieds(100,0,55,86,alliedPosition,-86)
    allied.vy = 1

    sprites.push(allied)
    allieds.push(allied)
  }

  //destroi inimigos
  function destroyEnemie(enemie) {
    enemie.state = enemie.exploded
    enemie.explode()
    playSound(explosion)
    setTimeout(() => {
      removeObjects(enemie,enemies)
      removeObjects(enemie,sprites)
    }, 1000);
  }

  //remove objetos do jogo
  function removeObjects(objectToRemove,array) {
    let index = array.indexOf(objectToRemove)
    if( index !== -1) {
      array.splice(index,1)
    }
  }

  //atualização do placar
  function updateScore() {
    if (shot === 0) {
      accuracy = 0
    } else {
      accuracy = Math.floor((hits / shot) * 100)
    }
    scoreMessage.text = 'Acertos: ' + hits + ' - Precisao: ' + accuracy + '%'
  }

  //função de game over
  function endGame() {
    if (hits < scoreToWin) {
      gameOverMessage.text = 'La ele'
    } else {
      gameOverMessage.text = 'Sextou!'
      gameOverMessage.fontColor = '#00f'
    }
    gameOverMessage.visible = true
    setTimeout(() => {
      location.reload()
    }, 3000);
  }

  //efeitos sonoros
  function playSound(soundType) {
    let sound = document.createElement('audio')
    switch (soundType) {
      case explosion:
        sound.src = 'audio/bop.ogg'
        break;
      case fire:
        sound.src = 'audio/tiupu.ogg'
        break;
      case win:
        sound.src = 'audio/sextou.ogg'
        break;
      case lose:
        sound.src = 'audio/la-ele.ogg'
        break;
      case dentro:
        sound.src = 'audio/e-dentro.ogg'
        break;
      case prefeitura:
        sound.src = 'audio/buraco.ogg'
        break;
    }
    sound.addEventListener('canplaythrough', () => {
      sound.play()
    }, false)
  }

  function render() {

    context.clearRect(0,0,canvas.width,canvas.height)

    //exibe os sprites
    if (sprites.length !== 0) {
      for (let index in sprites) {
        let spr = sprites[index]
        context.drawImage(img,spr.sourceX,spr.sourceY,spr.width,spr.height,Math.floor(spr.x),Math.floor(spr.y),spr.width,spr.height)
      }
    }
    //exibe os textos
    if (messages.length !== 0) {
      for (let index in messages) {
        let message = messages[index]
        if(message.visible) {
          context.font = message.font
          context.fillStyle = message.fontColor
          context.textBaseline = message.baseline
          message.x = (canvas.width - context.measureText(message.text).width) / 2
          context.fillText(message.text,message.x,message.y)
        }
      }
    }
  }

loop()

}())