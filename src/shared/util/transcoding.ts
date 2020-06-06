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
    result.push("|" + player.getId() + "/" + location[0].toFixed(1) + "/" + location[1].toFixed(1))
  })
  result[0] = result[0].substr(1)
  return result.join()
}

export function decodeLocations(encoded: string): Player[] {
  let result: Player[] = []
  console.log(encoded)
  encoded.split("|").forEach(group => {
    let player = group.split("/")
    result.push(new Player(player[0], +player[1], +player[2]))
  });
  console.log(result)
  return result
}

export function decodePlayerUpdate(encoded: string): [boolean, string] {
  if (encoded.substr(0, 1) == '0') {
    return [true, encoded.substr(1)]
  }
  return [false, encoded.substr(1)]
}

export function encodePlayerUpdate(remove: boolean, name: string): string {
  return remove + name
}
