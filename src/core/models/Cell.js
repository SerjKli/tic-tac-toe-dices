export class Cell {
  constructor(row, col, ownerId = null) {
    this.row = row
    this.col = col
    this.ownerId = ownerId
  }

  clone() {
    return new Cell(this.row, this.col, this.ownerId)
  }
}
