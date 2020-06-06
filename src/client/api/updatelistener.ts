
interface UpdateListener {
  updateLocation: (player: string, x: integer, y: integer) => any
  updatePlayer: (remove: boolean, player: string) => any
}