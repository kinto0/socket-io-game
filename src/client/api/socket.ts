import "socket.io-client"
import { encodeLocation, decodeLocations, decodePlayerUpdate } from "../../shared/util/transcoding"
import { Player } from "../../shared/model/player"
import { EmitEvent } from "../../shared/api/events"

// Class for communication with server
export default class Socket {
  socket: SocketIOClient.Socket

  constructor(l: UpdateListener) {
    this.socket = io()

    this.socket.on(EmitEvent.UPDATE_LOCATION, (data: string) => {
      decodeLocations(data).forEach((player: Player) => {
        var location: [integer, integer] = player.getLocation()
        l.updateLocation(player.getId(), location[0], location[1])
      });
    })
    this.socket.on(EmitEvent.MODIFIED_PLAYER, (data: string) => l.updatePlayer(...decodePlayerUpdate(data)))
    this.socket.on(EmitEvent.PLAYER_JOIN, (data: string) => l.onJoined(data))
  }

  updatePos(x: integer, y: integer) {
    this.socket.send(encodeLocation(x, y))
  }
}
