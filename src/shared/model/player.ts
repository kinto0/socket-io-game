import { v4 as uuid } from "uuid";

export class Player {
  private name!: string
  private uuid!: string
  private x: integer
  private y: integer

  constructor(id?: string, name?: string, x = 0, y = 0) {
    if (id == undefined) {
      this.uuid = uuid()
    } else {
      this.uuid = id
    }
    this.name = name
    this.x = x
    this.y = y
  }

  getName(): string {
    return this.name
  }

  getId(): string {
    return this.uuid
  }

  getLocation(): [integer, integer] {
    return [this.x, this.y]
  }

  setLocation(x: integer, y: integer) {
    this.x = x
    this.y = y
  }
}
