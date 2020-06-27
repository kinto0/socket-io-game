
interface UpdateListener {
  updateLocation: (player: string, x: integer, y: integer) => any
  updatePlayer: (remove: boolean, player: string, name: string) => any
  onJoined: (player: string) => any
}