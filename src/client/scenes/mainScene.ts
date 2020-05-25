import { Player } from "../../shared/model/player"

class Coords {
  x: integer
  y: integer
  z: integer
}

export default class MainScene extends Phaser.Scene {
  players: Player[]
  sprite: Phaser.Physics.Arcade.Sprite


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
    this.add.image(400, 300, 'sky');
    this.add.image(400, 300, 'star');

    let platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    this.sprite = this.physics.add.sprite(100, 450, 'dude');

    this.sprite.setBounce(0.2);
    this.sprite.setCollideWorldBounds(true);

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
    // player.body.setGravityY(300)

    this.physics.add.collider(this.sprite, platforms);

  }

  update() {
    let cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown)
    {
      this.sprite.setVelocityX(-160);

      this.sprite.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
      this.sprite.setVelocityX(160);

      this.sprite.anims.play('right', true);
    }
    else
    {
      this.sprite.setVelocityX(0);

      this.sprite.anims.play('turn');
    }

    if (cursors.up.isDown && this.sprite.body.touching.down)
    {
      this.sprite.setVelocityY(-330);
    }
  }
}