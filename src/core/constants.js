export const BOARD_SIZE = 6
export const WIN_LENGTH = 3
export const MAX_PLAYERS = 5
export const MIN_PLAYERS = 2

export const DECK_SIZE = 28
export const MAX_HAND_SIZE = 5

export const DEFAULT_MARKS = ['🧶', '💩', '👾', '👹', '🌌', '🕺','🦄', '🍃', '🌙', '🎈', '🪴', '🦋', '🍉', '🎨', '☁️', '🌸']
export const DEFAULT_COLORS = [
  '#e74c3c', '#3498db', '#e91e63', '#f39c12', '#9b59b6','#2cf740', '#A8DADC',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CE5A',
  '#FFE66D',
  '#D65DB1',
  '#FF9671',
  '#00C9A7',
  '#845EC2',
  '#0081CF'
]

export const DEFAULT_CHAT_EMOJIS = ['😀', '😂', '😍', '😢', '😡', '😮', '👍', '🎉', '🤔', '😴' ,'✅','⁉️','💋']

export const GameState = Object.freeze({
  IDLE: 'IDLE',
  SKIP_TURN_PHASE: 'SKIP_TURN_PHASE',
  CARD_PHASE: 'CARD_PHASE',
  ROLLING: 'ROLLING',
  CHOOSING: 'CHOOSING',
  GAME_OVER: 'GAME_OVER'
})

export const CellAction = Object.freeze({
  PLACE: 'PLACE',
  CAPTURE: 'CAPTURE',
  BLOCKED: 'BLOCKED',
  EXPLODE: 'EXPLODE'
})

export const GameMode = Object.freeze({
  CLASSIC: 'CLASSIC',
  ADVANCED: 'ADVANCED'
})

export const CardType = Object.freeze({
  DEFENSIVE: 'DEFENSIVE',
  OFFENSIVE: 'OFFENSIVE',
  EXPANDING: 'EXPANDING'
})



export const TurnAction = Object.freeze({
  SELECT_CARD: 'SELECT_CARD',
  ROLL_DICE:   'ROLL_DICE',
  SELECT_CELL: 'SELECT_CELL',
})
