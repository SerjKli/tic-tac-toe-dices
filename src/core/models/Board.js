import { BOARD_SIZE } from '../constants.js'
import { Cell } from './Cell.js'

export class Board {
  constructor(size = BOARD_SIZE) {
    this.size = size
    this.grid = Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, col) => new Cell(row, col))
    )
  }

  getCell(row, col) {
    return this.grid[row][col]
  }

  setOwner(row, col, ownerId) {
    this.grid[row][col].ownerId = ownerId
  }

  clone() {
    const b = new Board(this.size)
    b.grid = this.grid.map(row => row.map(cell => cell.clone()))
    return b
  }

  /** Flat list of all cells. */
  cells() {
    return this.grid.flat()
  }
}
