<script setup lang="ts">
import GameLayout from './components/game/GameLayout.vue'
</script>

<template>
  <div class="app">
    <header>
      <h1>Coffee Shop Empire</h1>
    </header>
    <main>
      <GameLayout />
    </main>
    <footer>
      <p>☕ A coffee-themed incremental game ☕</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', 'Arial', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
}

header {
  background-color: #5d4037;
  color: white;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

main {
  flex: 1;
  padding: 10px;
  overflow: auto;
}

footer {
  background-color: #5d4037;
  color: white;
  padding: 10px;
  text-align: center;
  font-size: 0.9rem;
}

@media (max-width: 767px) {
  h1 {
    font-size: 1.5rem;
  }
}
</style>
