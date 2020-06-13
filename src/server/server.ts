import * as express from "express"
import * as path from "path"
import { decodeLocation, encodeLocations, encodePlayerUpdate } from "../shared/util/transcoding"
import { Player } from "../shared/model/player"
import { EmitEvent } from "../shared/api/events"
import { ServerGame } from "./servergame"

const app = express()
app.set("port", process.env.PORT || 9001)

let http = require("http").Server(app)
let io = require("socket.io")(http)
let game = new ServerGame(updatePlayer, updateLocation)

app.use(express.static(path.join(__dirname, "../client")))

app.get("/", (req: any, res: any) => {
  res.sendFile(path.resolve("./dist/client/index.html"))
})

io.on("connection", function (socket: any) {
  let player = new Player()
  socket.emit(EmitEvent.PLAYER_JOIN, player.getId())
  let players = game.getPlayers()
  players.forEach((player: Player) => {
    console.log(player)
    socket.emit(EmitEvent.MODIFIED_PLAYER, encodePlayerUpdate(false, player.getId(), player.getName()))
  })
  socket.emit(EmitEvent.UPDATE_LOCATION, encodeLocations(players))

  console.log("Client " + player.getId() + " connected!")

  socket.on("join", function (name: string) {
    game.addPlayer(player.getId(), name)

    socket.on("message", function (data: string) {
      game.updateLocation(player.getId(), ...decodeLocation(data));
    })
  });

  socket.on("disconnect", function (reason: any) {
    console.log(player.getId() + " disconnected")
    game.removePlayer(player.getId())
  })
})

http.listen(9001, function () {
  console.log("listening on *:9001")
})

function updateLocation(player: string, x: integer, y: integer) {
  let p: Player = new Player(player, null, x, y)
  io.emit(EmitEvent.UPDATE_LOCATION, encodeLocations([p]))
}

function updatePlayer(remove: boolean, id: string, name: string) {
  io.emit(EmitEvent.MODIFIED_PLAYER, encodePlayerUpdate(remove, id, name))
}
