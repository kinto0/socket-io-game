import Socket from '../api/socket'

export default class MainScene extends Phaser.Scene implements UpdateListener {
  socket: Socket
  prev_location: [integer, integer] = [0, 0]
  players: Map<string, Phaser.Physics.Arcade.Sprite> = new Map()
  platforms: Phaser.Physics.Arcade.StaticGroup
  controlling_id: string

  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');

    this.load.spritesheet('dude',
      'assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  create() {
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
    this.socket = new Socket(this)
  }

  createPlayer(id: string) {
    if (this.players.has(id)) {
      return
    }
    let player = this.physics.add.sprite(100, 450, 'dude')
    this.players.set(id, player)

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, this.platforms);
    return player
  }

  removePlayer(id: string) {
    this.players.get(id).destroy()
    this.players.delete(id)
  }

  update() {
    let cursors = this.input.keyboard.createCursorKeys()
    if (this.controlling_id) {
      let sprite = this.players.get(this.controlling_id)

      if (cursors.left.isDown) {
        sprite.setVelocityX(-160)
        sprite.anims.play('left', true)
      } else if (cursors.right.isDown) {
        sprite.setVelocityX(160);
        sprite.anims.play('right', true)
      } else {
        sprite.setVelocityX(0)
        sprite.anims.play('turn')
      }

      if (cursors.up.isDown && sprite.body.touching.down) {
        sprite.setVelocityY(-330)
      }

      if (sprite.x != this.prev_location[0] || sprite.y != this.prev_location[1]) {
        this.socket.updatePos(sprite.x, sprite.y)
        this.prev_location = [sprite.x, sprite.y]
      }
    }
  }

  // callbacks
  updateLocation(player: string, x: integer, y: integer) {
    console.log("update position of " + player)
    console.log(this.players)
    if (player == this.controlling_id) {
      return
    }
    if (!this.players.has(player)) {
      this.createPlayer(player)
    }
    let dx = x - this.players.get(player).x
    let sprite = this.players.get(player)
    if (dx < 0) {
      sprite.anims.play('left', true)
    } else if (dx > 0) {
      sprite.anims.play('right', true)
    } else {
      sprite.anims.play('turn')
    }
    sprite.x = x
    sprite.y = y
  }

  updatePlayer(remove: boolean, player: string) {
    if (remove) {
      console.log("player disconnected! " + player)
      this.removePlayer(player)
    } else {
      console.log("new player joined! " + player)
      this.createPlayer(player)
    }
  }

  onJoined(player: string) {
    this.createPlayer(player)
    this.controlling_id = player
  }
}
