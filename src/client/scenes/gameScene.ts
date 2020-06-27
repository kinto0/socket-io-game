import Socket from '../api/socket'

const DUDE_W: integer = 32
const DUDE_H: integer = 48

export default class GameScene extends Phaser.Scene implements UpdateListener {
  socket: Socket
  menu: Phaser.GameObjects.DOMElement
  name_input: HTMLInputElement
  prev_location: [integer, integer] = [0, 0]
  players: Map<string, Phaser.GameObjects.Container> = new Map()
  platforms: Phaser.Physics.Arcade.StaticGroup
  controlling_id: string

  constructor() {
    super({ key: 'GameScene' })
  }

  preload() {
    this.load.image('sky', 'assets/sky.png')
    this.load.image('ground', 'assets/platform.png')
    this.load.image('star', 'assets/star.png')
    this.load.image('bomb', 'assets/bomb.png')

    this.load.spritesheet('dude',
      'assets/dude.png',
      { frameWidth: DUDE_W, frameHeight: DUDE_H }
    )

    this.name_input = document.createElement('input')
    this.menu = this.add.dom(400, 200, this.name_input)
  }

  create() {
    this.createScene()
    this.socket = new Socket(this)
    this.menu.addListener('keyup')
    this.menu.on('keyup', (event: any) => {
      if (event.keyCode === 13) {
        this.socket.join(this.name_input.value)
        this.menu.setVisible(false)
        this.menu.removeAllListeners()
      }
    })
  }

  createScene() {
    this.add.image(400, 300, 'sky')
    this.add.image(400, 300, 'star')

    this.platforms = this.physics.add.staticGroup()

    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()
    this.platforms.create(600, 400, 'ground')
    this.platforms.create(50, 250, 'ground')
    this.platforms.create(750, 220, 'ground')

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });
  }

  createPlayer(id: string, name: string) {
    if (this.players.has(id)) {
      return
    }
    let sprite = this.add.sprite(0, 0, 'dude')
    let text = this.add.text(0, -50, name)

    let player = this.add.container(100, 450, [sprite, text])
    player.setSize(DUDE_W, DUDE_H)

    this.players.set(id, player)

    this.physics.world.enable(player)
    let body = player.body as Phaser.Physics.Arcade.Body

    body.setBounce(0.2, 0.2).setCollideWorldBounds(true)
    this.physics.add.collider(player, this.platforms)
    return player
  }

  removePlayer(id: string) {
    this.players.get(id).destroy()
    this.players.delete(id)
  }

  update() {
    let cursors = this.input.keyboard.createCursorKeys()
    if (this.controlling_id) {
      let player = this.players.get(this.controlling_id)
      let body = player.body as Phaser.Physics.Arcade.Body
      let sprite = player.first as Phaser.Physics.Arcade.Sprite

      if (cursors.left.isDown) {
        body.setVelocityX(-160)
        sprite.play('left', true)
      } else if (cursors.right.isDown) {
        body.setVelocityX(160);
        sprite.anims.play('right', true)
      } else {
        body.setVelocityX(0)
        sprite.anims.play('turn')
      }

      if (cursors.up.isDown && body.touching.down) {
        body.setVelocityY(-330)
      }

      if (player.x != this.prev_location[0] || player.y != this.prev_location[1]) {
        this.socket.updatePos(player.x, player.y)
        this.prev_location = [player.x, player.y]
      }
    }
  }

  // callbacks
  updateLocation(id: string, x: integer, y: integer) {
    if (id == this.controlling_id) {
      return
    }
    if (!this.players.has(id)) {
      return
    }
    let dx = x - this.players.get(id).x
    let player = this.players.get(id)
    let sprite = player.first as Phaser.Physics.Arcade.Sprite
    if (dx < 0) {
      sprite.anims.play('left', true)
    } else if (dx > 0) {
      sprite.anims.play('right', true)
    } else {
      sprite.anims.play('turn')
    }
    player.x = x
    player.y = y
  }

  updatePlayer(remove: boolean, id: string, name: string) {
    if (remove) {
      console.log("player disconnected! " + id)
      this.removePlayer(id)
    } else {
      console.log("new player joined! " + id)
      this.createPlayer(id, name)
    }
  }

  onJoined(player: string) {
    this.createPlayer(player, "You")
    this.controlling_id = player
  }
}
