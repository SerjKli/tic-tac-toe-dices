export const BOARD_SIZE = 6
export const WIN_LENGTH = 3
export const MAX_PLAYERS = 5
export const MIN_PLAYERS = 2

export const DECK_SIZE = 28
export const MAX_HAND_SIZE = 5

export const ABANDONED_GRACE_MS = 15000

export const MARKS_SPRITE = './images/sprites/marks.png'
export const MARKS_SPRITE_MINI = './images/sprites/marks_mini.png'

export const DEFAULT_MARKS = [
    //Sprites
    // star, heart, diamond, coin, rock, tree, flag
    'mn:-4:-4:238:84', 'mn:-38:-4:238:84', 'mn:-71:-4:238:84', 'mn:-103:-4:238:84', 'mn:-136:-4:238:84', 'mn:-170:-4:238:84', 'mn:-204:-4:238:84',
    // sword, shield, skull, red-potion, chest, blue-potion, fire
    'mn:-4:-42:238:84', 'mn:-36:-42:238:84', 'mn:-70:-42:238:84', 'mn:-102:-42:238:84', 'mn:-136:-42:238:84', 'mn:-170:-42:238:84', 'mn:-204:-42:238:84',

    // Emojis
    '🧶', '💩', '👾', '👹', '🌌', '🕺', '🦄', '🌿', '🌙', '🎈', '🪴', '🦋', '🍉', '🎨', '☁️', '🌸',
]
export const DEFAULT_COLORS = [
  '#ef4444', '#3b82f6', '#ec4899', '#f59e0b', '#9d7be0',
  '#22c55e', '#5ec5b8', '#ff8a7a', '#2dd4bf', '#38bdf8',
  '#84cc16', '#fde047', '#e879f9', '#fb923c', '#14b8a6',
  '#7c3aed', '#2563eb', '#f472b6', '#34d399', '#fb7185',
  '#60a5fa'
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

export const CardId = Object.freeze({
  ROW_MARK: 'ROW_MARK',
  COL_MARK: 'COL_MARK',
  AREA_3X3: 'AREA_3X3',
  SHIELD: 'SHIELD',
  EXPLOSION4: 'EXPLOSION4',
  SKIP_TURN: 'SKIP_TURN',
  CLEANSE: 'CLEANSE',
  EXTRA_TURN: 'EXTRA_TURN',
  RANDOM_CLEAR3: 'RANDOM_CLEAR3',
  SHAKE: 'SHAKE',
})


export const TurnAction = Object.freeze({
  SELECT_CARD: 'SELECT_CARD',
  ROLL_DICE:   'ROLL_DICE',
  SELECT_CELL: 'SELECT_CELL',
})
