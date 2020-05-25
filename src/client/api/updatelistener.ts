
interface UpdateListener {
  updateLocation: (player: string, x: integer, y: integer) => any
  newPlayer: (player: string) => any
}