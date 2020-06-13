import { Player } from "../shared/model/player"

export class ServerGame {
  players: Map<string, Player>
  modifiedPlayerListener: (remove: boolean, id: string, name: string) => any
  updateLocationListener: (player: string, x: integer, y: integer) => any

  constructor(modifiedPlayerListener: (remove: boolean, id: string, name: string) => any, updateLocationListener: (player: string, x: integer, y: integer) => any) {
    this.players = new Map()
    this.modifiedPlayerListener = modifiedPlayerListener
    this.updateLocationListener = updateLocationListener
  }

  addPlayer(id: string, name: string): any {
    this.players.set(id, new Player(id, name))
    this.modifiedPlayerListener(false, id, name)
  }

  removePlayer(id: string): any {
    this.modifiedPlayerListener(true, id, this.players.get(id).getName())
    this.players.delete(id)
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
