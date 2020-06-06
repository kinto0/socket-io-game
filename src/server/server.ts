import * as express from "express"
import * as path from "path"
import { decodeLocation, encodeLocations, encodePlayerUpdate } from "../shared/util/transcoding"
import { Player } from "../shared/model/player"
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
  game.addPlayer(player.getId())

  console.log("Client " + player.getId() + " connected!")

  socket.on("disconnect", function (reason: any) {
    console.log(player.getId() + " disconnected")
    game.removePlayer(player.getId())
  })

  socket.on("message", function (data: string) {
    game.updateLocation(player.getId(), ...decodeLocation(data));
  })
})

http.listen(9001, function () {
  console.log("listening on *:9001")
})

function updateLocation(player: string, x: integer, y: integer) {
  let p: Player = new Player(player)
  p.setLocation(x, y)
  io.emit("update location", encodeLocations([p]))
}

function updatePlayer(remove: boolean, player: string) {
  io.emit("modified player", encodePlayerUpdate(remove, player))
}
