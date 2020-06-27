import { Player } from "../model/player"

export function encodeLocation(x: integer, y: integer): string {
  return x + ',' + y
}

export function decodeLocation(encoded: string): [integer, integer] {
  let location: string[] = encoded.split(",")
  return [+location[0], +location[1]]
}

//todo: make this encoding actually decent
export function encodeLocations(players: Player[]): string {
  let result: string[] = []
  players.forEach((player) => {
    let location = player.getLocation()
    result.push(player.getId() + "/" + location[0].toFixed(1) + "/" + location[1].toFixed(1))
  })
  return result.join("|")
}

export function decodeLocations(encoded: string): Player[] {
  let result: Player[] = []
  encoded.split("|").forEach(group => {
    let player = group.split("/")
    result.push(new Player(player[0], null, +player[1], +player[2]))
  });
  return result
}

export function decodePlayerUpdate(encoded: string): [boolean, string, string] {
  let remove = encoded.substr(0, 1) == '1'
  let data = encoded.substr(1).split("|")
  return [remove, data[0], data[1]]
}

export function encodePlayerUpdate(remove: boolean, id: string, name: string): string {
  return Number(remove) + id + "|" + name
}
