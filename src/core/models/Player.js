export class Player {
  constructor({ id, name, mark, color }) {
    this.id = id
    this.name = name
    this.mark = mark
    this.color = color
    this.hand = []
    this.skipTurnCount = 0
    this.extraTurnCount = 0
  }
}
