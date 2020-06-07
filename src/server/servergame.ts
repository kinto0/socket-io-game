import { Player } from "../shared/model/player"

export class ServerGame {
  players: Map<string, Player>
  modifiedPlayerListener: (remove: boolean, player: string) => any
  updateLocationListener: (player: string, x: integer, y: integer) => any

  constructor(modifiedPlayerListener: (remove: boolean, player: string) => any, updateLocationListener: (player: string, x: integer, y: integer) => any) {
    this.players = new Map()
    this.modifiedPlayerListener = modifiedPlayerListener
    this.updateLocationListener = updateLocationListener
  }

  addPlayer(player: string): any {
    this.players.set(player, new Player(player))
    this.modifiedPlayerListener(false, player)
  }

  removePlayer(player: string): any {
    this.players.delete(player)
    this.modifiedPlayerListener(true, player)
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values())
  }

  getLocation(player: string): [integer, integer] {
    return this.players.get(player).getLocation()
  }

  updateLocation(player: string, x: integer, y: integer): void {
    if (!this.players.has(player)) {
      return
    }
    this.players.get(player).setLocation(x, y)
    this.updateLocationListener(player, x, y)
  }
}
