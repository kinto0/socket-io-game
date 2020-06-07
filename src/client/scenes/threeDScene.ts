import Socket from '../api/socket'
import { Scene3D, ExtendedObject3D, THREE } from 'enable3d'

export default class threeDScene extends Scene3D implements UpdateListener {
  socket: Socket
  prev_location: [integer, integer] = [0, 0]
  players: Map<string, ExtendedObject3D> = new Map()
  keys: Map<string, any> = new Map()
  platforms: Phaser.Physics.Arcade.StaticGroup
  controlling_id: string

  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {
    // this.load.image('sky', 'assets/sky.png');
  }

  init() {
    // this.accessThirdDimension({ gravity: { x: 0, y: -20, z: 0 } })
  }

  create() {
    this.warpSpeed('-ground', '-sky', '-orbitControls')

    // adjust gamma factor
    this.renderer.gammaFactor = 1.2

    // adjust the camera
    this.camera.position.set(0, 5, 20)
    this.camera.lookAt(0, 0, 0)


    // let sky = this.add.image(this.cameras.perspectiveCamera.length / 2, this.cameras.perspectiveCamera.length / 2, 'sky')
    // const scaleX = this.cameras.main.width / sky.width
    // const scaleY = this.cameras.main.height / sky.height
    // const scale = Math.max(scaleX, scaleY)
    // sky.depth = -1
    // sky.setScale(10).setScrollFactor(0)

    const platformMaterial = { phong: { transparent: true, color: 0x21572f } }
    const platforms = [
      this.physics.add.box({ name: 'platform-ground', y: -2, width: 30, depth: 5, height: 2, mass: 0 }, platformMaterial),
      this.physics.add.box({ name: 'platform-right1', x: 7, y: 4, width: 15, depth: 5, mass: 0 }, platformMaterial),
      this.physics.add.box({ name: 'platform-left', x: -10, y: 7, width: 10, depth: 5, mass: 0 }, platformMaterial),
      this.physics.add.box({ name: 'platform-right2', x: 10, y: 10, width: 10, depth: 5, mass: 0 }, platformMaterial)
    ]


    this.socket = new Socket(this)
  }

  createPlayer(id: string) {
    if (this.players.has(id)) {
      return
    }
    /**
     * Model by Tomás Laulhé (https://www.patreon.com/quaternius), modifications by Don McCurdy (https://donmccurdy.com)
     * https://threejs.org/examples/#webgl_animation_skinning_morph
     * CC-0 license
     */
    this.load.gltf('/assets/glb/robot.glb').then(gltf => {
      let robot = new ExtendedObject3D()
      this.players.set(id, robot)
      robot.add(gltf.scene)
      const scale = 1 / 3
      robot.scale.set(scale, scale, scale)

      robot.traverse(child => {
        if (child) {
          child.castShadow = child.receiveShadow = true
        }
      })
      // animations
      robot.mixer = this.animationMixers.create(robot)
      gltf.animations.forEach(animation => {
        robot.anims[animation.name] = animation
      })
      robot.setAction('Idle')

      this.add.existing(robot)
      this.physics.add.existing(robot, { shape: 'box', width: 0.5, depth: 0.5, offset: { y: -0.5 } })
      robot.body.setLinearFactor(1, 1, 0)
      robot.body.setAngularFactor(0, 0, 0)
      robot.body.setFriction(0)
    })
  }

  initCurrentPlayer() {
    if (!this.controlling_id) {
      return
    }

    let robot = this.players.get(this.controlling_id)

    this.camera.lookAt(robot.position)

    // add a sensor
    const sensor = new ExtendedObject3D()
    sensor.position.setY(-0.5)
    this.physics.add.existing(sensor, { mass: 1e-8, shape: 'box', width: 0.2, height: 0.2, depth: 0.2 })
    sensor.body.setCollisionFlags(4)

    // connect sensor to robot
    this.physics.add.constraints.lock(robot.body, sensor.body)

    // detect if sensor is on the ground
    sensor.body.on.collision((otherObject, event) => {
      if (/platform/.test(otherObject.name)) {
        if (event !== 'end') robot.userData.onGround = true
        else robot.userData.onGround = false
      }
    })
    // add keys
    // this.keys.set('w', this.input.keyboard.addKey('w'))
    // this.keys.set('a', this.input.keyboard.addKey('a'))
    // this.keys.set('d', this.input.keyboard.addKey('d'))
  }

  walkAnimation(id: string) {
    if (this.players.get(id).currentAnimation !== 'Walking') this.players.get(id).setAction('Walking')
  }

  idleAnimation(id: string) {
    if (this.players.get(id).currentAnimation !== 'Idle') this.players.get(id).setAction('Idle')
  }

  removePlayer(id: string) {
    this.destroy(this.players.get(id))
    this.players.delete(id)
  }

  update() {
    if (this.controlling_id && this.players.get(this.controlling_id)) {
      let robot = this.players.get(this.controlling_id)

      // add just the camera position
      this.camera.position.copy(robot.position).add(new THREE.Vector3(0, 5, 16))

      // get rotation of robot
      const theta = robot.world.theta
      robot.body.setAngularVelocityY(0)

      // set the speed variable
      const speed = 7

      // move left
      if (this.keys.get('a').isDown) {
        robot.body.setVelocityX(-speed)
        if (theta > -(Math.PI / 2)) robot.body.setAngularVelocityY(-10)
        this.walkAnimation(this.controlling_id)
      }
      // move right
      else if (this.keys.get('d').isDown) {
        robot.body.setVelocityX(speed)
        if (theta < Math.PI / 2) robot.body.setAngularVelocityY(10)
        this.walkAnimation(this.controlling_id)
      }
      // do not move
      else {
        robot.body.setVelocityX(0)
        this.idleAnimation(this.controlling_id)
      }

      // jump
      if (this.keys.get('w').isDown && robot.userData.onGround && Math.abs(robot.body.velocity.y) < 1e-1) {
        robot.setAction('WalkJump')
        robot.body.applyForceY(16)
      }
    }
  }

  // callbacks
  updateLocation(player: string, x: integer, y: integer) {
    // if (player == this.controlling_id) {
    //   return
    // }
    // if (!this.players.has(player)) {
    //   this.createPlayer(player)
    // }
    // let dx = x - this.players.get(player).x
    // let sprite = this.players.get(player)
    // if (dx < 0) {
    //   sprite.anims.play('left', true)
    // } else if (dx > 0) {
    //   sprite.anims.play('right', true)
    // } else {
    //   sprite.anims.play('turn')
    // }
    // sprite.x = x
    // sprite.y = y
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
    this.initCurrentPlayer()
  }
}
