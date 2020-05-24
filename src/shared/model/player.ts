import { v4 as uuid } from "uuid";

export class Player {
  private name!: string
  private uuid!: string
  private x: integer
  private y: integer

  constructor() {
    this.uuid = uuid()
    this.name = ""
    this.x = 0
    this.y = 0
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
}
