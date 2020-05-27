import "socket.io-client"
import { encodeLocation, decodeLocations } from "../../shared/util/transcoding"
import { Player } from "../../shared/model/player"

// Class for communication with server
export default class Socket {
  socket: SocketIOClient.Socket

  constructor(l: UpdateListener) {
    this.socket = io("http://localhost:9001")

    this.socket.on("update location", (data: string) => {
      decodeLocations(data).forEach((player: Player) => {
        var location: [integer, integer] = player.getLocation()
        l.updateLocation(player.getId(), location[0], location[1])
      });
    })
    this.socket.on("new player", (data: string) => l.newPlayer(data))
  }

  updatePos(x: integer, y: integer) {
    console.log("updating position: (" + x + ", " + y + ")")
    this.socket.send(encodeLocation(x, y))
  }
}
