import "socket.io-client"
import { encodeLocation, decodeLocations } from "../shared/util/transcoding"
import { Player } from "../shared/model/player"
import { EmitEvent } from "../shared/api/events"

// Class for communication with server
export default class Socket {
  socket: SocketIOClient.Socket

  constructor(updateListener: (player: string, x: integer, y: integer) => any, playersModifiedListener: (remove: boolean, player: string) => any) {
    this.socket = io("http://localhost:9001")

    this.socket.on(EmitEvent.UPDATE_LOCATION, (data: string) => {
      decodeLocations(data).forEach((player: Player) => {
        updateListener(player.getId(), ...player.getLocation())
      });
    })
    this.socket.on(EmitEvent.MODIFIED_PLAYER, playersModifiedListener)
  }

  updatePos(x: integer, y: integer) {
    console.log("updating position: (" + x + ", " + y + ")")
    this.socket.send(encodeLocation(x, y))
  }
}
