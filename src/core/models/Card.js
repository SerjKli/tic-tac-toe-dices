export class Card {
  constructor({ id, nameKey, descKey, color, type, weight, behavior, receivedMsgKey = null }) {
    this.id = id
    this.nameKey = nameKey
    this.descKey = descKey
    this.color = color
    this.type = type
    this.weight = weight
    this.behavior = behavior
    this.receivedMsgKey = receivedMsgKey
  }
}
