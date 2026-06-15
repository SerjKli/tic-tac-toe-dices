<template>
  <div class="pixel-logo">
    <span class="die-bounce">🎲</span>
    <h1 class="pixel-title">
      <span class="t-tic">TIC</span><span class="t-sep">-</span><span class="t-tac">TAC</span><span class="t-sep">-</span><span class="t-dice">DICE</span>
    </h1>
  </div>
</template>

<style scoped>
.pixel-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  margin: 6px 0 16px;
}

.die-bounce {
  font-size: 40px;
  display: inline-block;
  animation: px-bob 2.4s ease-in-out infinite;
}

.pixel-title {
  font-family: 'Press Start 2P', monospace;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  justify-content: center;
  align-items: center;
  font-size: clamp(20px, 6.2vw, 38px);
  line-height: 1.15;
}

.t-tic  { color: #46b6e8; text-shadow: 4px 4px 0 #2c2a4a; }
.t-tac  { color: #ff7a6b; text-shadow: 4px 4px 0 #2c2a4a; }
.t-dice { color: #9d7be0; text-shadow: 4px 4px 0 #2c2a4a; }
.t-sep  { color: #2c2a4a; margin: 0 2px; }
</style>
