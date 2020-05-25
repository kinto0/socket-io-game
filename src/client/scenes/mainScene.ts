import Socket from '../api/socket'

export default class MainScene extends Phaser.Scene implements UpdateListener {
  socket: Socket
  prev_location: [integer, integer] = [0, 0]
  players: Map<string, Phaser.Physics.Arcade.Sprite> = new Map()
  platforms: Phaser.Physics.Arcade.StaticGroup

  constructor() {
    super({ key: 'MainScene' })
    this.socket = new Socket(this)
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
    this.add.image(400, 300, 'sky');
    this.add.image(400, 300, 'star');

    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    this.createPlayer('self')

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

  createPlayer(id: string) {
    let player = this.physics.add.sprite(100, 450, 'dude');
    this.players.set(id, player)

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(player, this.platforms);
    return player
  }

  update() {
    let cursors = this.input.keyboard.createCursorKeys();
    let sprite = this.players.get('self')

    if (cursors.left.isDown) {
      sprite.setVelocityX(-160);
      sprite.anims.play('left', true);
    } else if (cursors.right.isDown) {
      sprite.setVelocityX(160);
      sprite.anims.play('right', true);
    } else {
      sprite.setVelocityX(0);
      sprite.anims.play('turn');
    }

    if (cursors.up.isDown && sprite.body.touching.down) {
      sprite.setVelocityY(-330);
    }

    if (sprite.x != this.prev_location[0] || sprite.y != this.prev_location[1]) {
      this.socket.updatePos(sprite.x, sprite.y)
      this.prev_location = [sprite.x, sprite.y]
    }
  }

  // callbacks

  updateLocation(player: string, x: integer, y: integer) {
    console.log("update position of " + player)
    console.log(this.players)
    if (!this.players.has(player)) {
      this.newPlayer(player)
    }
    this.players.get(player).x = x
    this.players.get(player).y = y
  }

  newPlayer(player: string) {
    console.log("new player joined! " + player)
    this.createPlayer(player)
  }
}