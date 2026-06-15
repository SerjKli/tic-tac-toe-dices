import {CardId, CardType} from './constants.js'
import { Card } from './models/Card.js'

export const CARDS = Object.freeze({
  ROW_MARK: new Card({
    id: CardId.ROW_MARK,
    nameKey: 'cards.rowMark.name',
    descKey: 'cards.rowMark.desc',
    color: '#4CAF50',
    type: CardType.EXPANDING,
    weight: 0.7,
    behavior: 'DEFERRED'
  }),
  COL_MARK: new Card({
    id: CardId.COL_MARK,
    nameKey: 'cards.colMark.name',
    descKey: 'cards.colMark.desc',
    color: '#2196F3',
    type: CardType.EXPANDING,
    weight: 0.7,
    behavior: 'DEFERRED'
  }),
  AREA_3X3: new Card({
    id: CardId.AREA_3X3,
    nameKey: 'cards.area3x3.name',
    descKey: 'cards.area3x3.desc',
    color: '#9C27B0',
    type: CardType.EXPANDING,
    weight: 0.5,
    behavior: 'DEFERRED'
  }),
  SHIELD: new Card({
    id: CardId.SHIELD,
    nameKey: 'cards.shield.name',
    descKey: 'cards.shield.desc',
    color: '#607D8B',
    type: CardType.DEFENSIVE,
    weight: 0.6,
    behavior: 'SIDE_EFFECT'
  }),
  EXPLOSION4: new Card({
    id: CardId.EXPLOSION4,
    nameKey: 'cards.explosion4.name',
    descKey: 'cards.explosion4.desc',
    color: '#FF5722',
    type: CardType.OFFENSIVE,
    weight: 0.3,
    behavior: 'DEFERRED'
  }),
  SKIP_TURN: new Card({
    id: CardId.SKIP_TURN,
    nameKey: 'cards.skipTurn.name',
    descKey: 'cards.skipTurn.desc',
    color: '#F44336',
    type: CardType.OFFENSIVE,
    weight: 0.5,
    behavior: 'SIDE_EFFECT',
    receivedMsgKey: 'cards.skipTurn.receivedDesc'
  }),
  CLEANSE: new Card({
    id: CardId.CLEANSE,
    nameKey: 'cards.cleanse.name',
    descKey: 'cards.cleanse.desc',
    color: '#00BCD4',
    type: CardType.DEFENSIVE,
    weight: 0.5,
    behavior: 'SIDE_EFFECT'
  }),
  EXTRA_TURN: new Card({
    id: CardId.EXTRA_TURN,
    nameKey: 'cards.extraTurn.name',
    descKey: 'cards.extraTurn.desc',
    color: '#FF9800',
    type: CardType.DEFENSIVE,
    weight: 0.3,
    behavior: 'SIDE_EFFECT'
  }),
  RANDOM_CLEAR3: new Card({
    id: CardId.RANDOM_CLEAR3,
    nameKey: 'cards.randomClear3.name',
    descKey: 'cards.randomClear3.desc',
    color: '#795548',
    type: CardType.OFFENSIVE,
    weight: 0.3,
    behavior: 'IMMEDIATE'
  }),
  SHAKE: new Card({
    id: CardId.SHAKE,
    nameKey: 'cards.shake.name',
    descKey: 'cards.shake.desc',
    color: '#FF6B6B',
    type: CardType.OFFENSIVE,
    weight: 0.3,
    behavior: 'IMMEDIATE'
  })
})
