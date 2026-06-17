# TIC-TAC-DICE DESIGN SYSTEM

## Project

Retro dark theme redesign inspired by:

- Dendy (NES)
- Sega Mega Drive
- Arcade cabinets
- CRT televisions
- 8-bit / 16-bit games

IMPORTANT:
Do not modify layouts.

---

# Design Goals

The game should feel like:

- a cartridge game from 1994
- running on a CRT television
- modernized for web
- dark and premium
- readable on desktop and mobile

---

# Design Tokens

## Colors

### Background

| Token | Value |
|---------|---------|
| bg-primary | #070b14 |
| bg-secondary | #0f1728 |
| bg-panel | #111b2f |

### Neon

| Token | Value |
|---------|---------|
| neon-blue | #2d8cff |
| neon-purple | #9b4dff |
| neon-green | #41ff79 |
| neon-orange | #ff9f1a |
| neon-red | #ff5252 |

### Borders

| Token | Value |
|---------|---------|
| border-default | #263654 |

---

# Typography

## Heading Font

Pixelify Sans

Fallback:

```css
Pixelify Sans,
Press Start 2P,
monospace
```

## Body Font

Inter

Fallback:

```css
Inter,
sans-serif
```

---

# Component Library

## Button

### Primary

Purpose:
Main actions.

Examples:

- Start Game
- Confirm Move

Style:

```css
background: linear-gradient(
180deg,
#3aff6e,
#149c3c
);
```

States:

- default
- hover
- active
- disabled

---

## Toggle Button

Used for:

- Players count
- Online / Local
- Game Mode

Selected state:

```css
border-color: var(--neon-blue);
box-shadow: 0 0 12px var(--neon-blue);
```

---

## Input

Style:

```css
background: #0b1324;
border: 2px solid #263654;
```

Focus:

```css
border-color: var(--neon-blue);
```

---

## Player Card

Structure:

PlayerCard
├── Header
├── NameInput
├── SymbolGrid
└── ColorPicker

Requirements:

- dark background
- neon border
- player color glow

---

## Symbol Grid

Cell size:

48px

Selected:

- blue glow
- scale 1.05

---

## Color Picker

Selected color:

- white ring
- outer glow

---

## Ability Card

Structure:

AbilityCard
├── Icon
├── Title
└── Description

Types:

- Extra Turn
- Column
- Shield
- Area 3x3

Each type has unique neon color.

---

## Game Board

Board dimensions remain unchanged.

Cell style:

```css
background: #0d1526;
border: 1px solid #263654;
```

Hover:

```css
background: rgba(45,140,255,0.15);
```

Selected:

```css
border-color: #41ff79;
```

---

# Screen Specifications

## Setup Screen

Keep exact layout.

Visual changes:

- dark background
- arcade panels
- pixel logo
- neon buttons
- retro cards

### Sections

1. Header
2. Players Count
3. Online / Local
4. Game Mode
5. Start Button
6. Player Cards

---

## Game Screen

Keep exact layout.

### Left Panel

Player hand.

Contains:

- Ability cards
- Retro card design
- Neon category colors

### Right Panel

Board.

Contains:

- Grid
- Marks
- Hover states
- Active move state

### Top Area

Player indicators.

Style:

Retro scoreboards.

---

# Animations

Allowed:

## Glow Pulse

Duration:

1500ms

Targets:

- active player
- selected cell
- primary button

## Hover Scale

Duration:

150ms

Scale:

1.05

## CRT Flicker

Opacity:

98% → 100%

Very subtle.

---

# Assets

Required assets:

- Pixel dice icon
- Pixel UI corners
- Pixel decorative borders
- CRT texture overlay

Optional:

- Animated scanlines

---

# Accessibility

Minimum contrast ratio:

4.5:1

Do not rely solely on color.

Selected state must always have:

- border
- glow
- color

---

# Implementation Rules

1. Never change layout.
2. Never change spacing hierarchy.
3. Never move components.
4. Never replace emojis with images.
5. Preserve responsive behavior.
6. Preserve all game mechanics.
7. Preserve all current interactions.
8. Only update visual presentation.