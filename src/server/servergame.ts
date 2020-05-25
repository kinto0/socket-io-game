import { Player } from "../shared/model/player"

export class ServerGame {
  players: Map<string, Player>
  addPlayerListener: (player: string) => any
  updateLocationListener: (player: string, x: integer, y: integer) => any

  constructor(addPlayerListener: (player: string) => any, updateLocationListener: (player: string, x: integer, y: integer) => any) {
    this.players = new Map()
    this.addPlayerListener = addPlayerListener
    this.updateLocationListener = updateLocationListener
  }

  addPlayer(player: string): any {
    this.players.set(player, new Player(player))
    this.addPlayerListener(player)
  }

  removePlayer(player: string): any {
    this.players.delete(player)
  }

  getLocation(player: string): [integer, integer] {
    return this.players.get(player).getLocation()
  }

  updateLocation(player: string, x: integer, y: integer): void {
    this.players.get(player).setLocation(x, y)
    this.updateLocationListener(player, x, y)
  }
}
