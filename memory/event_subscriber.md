// wherever you create or access the engine instance
engine.addEventListener('shake-applied', (e) => {
console.log(e.detail) // { type: 'shake-applied' }
// trigger animation, update store state, etc.
})

In a Pinia store it would look like:

const engine = new GameEngine()

engine.addEventListener('shake-applied', (e) => {
this.lastEffect = 'shake' // or set a flag to trigger a CSS animation
})

In a Vue component using onMounted:

const { engine } = useGameStore()

onMounted(() => {
engine.addEventListener('shake-applied', (e) => { /* ... */ })
})

onUnmounted(() => {
engine.removeEventListener('shake-applied', (e) => { /* ... */ })
})

The detail property of the event carries whatever was in the second argument to _emit — in this case just { type: 'shake-applied' }, but you could enrich it in CardEngine (e.g. add the affected cells) and
it'll show up there.
