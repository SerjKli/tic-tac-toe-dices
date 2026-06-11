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

  clone() {
    const p = new Player({ id: this.id, name: this.name, mark: this.mark, color: this.color })
    p.hand = [...this.hand]
    p.skipTurnCount = this.skipTurnCount
    p.extraTurnCount = this.extraTurnCount
    return p
  }
}
