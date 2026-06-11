export class Cell {
  constructor(row, col, ownerId = null, shieldCount = 0) {
    this.row = row
    this.col = col
    this.ownerId = ownerId
    this.shieldCount = shieldCount
  }

  clone() {
    return new Cell(this.row, this.col, this.ownerId, this.shieldCount)
  }
}
