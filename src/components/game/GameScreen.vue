<script setup lang="ts">
import ResourceDisplay from './ResourceDisplay.vue'
import ManualActions from './ManualActions.vue'
import AutomationSection from './AutomationSection.vue'
import UpgradesSection from './UpgradesSection.vue'
</script>

<template>
  <div class="game-container">
    <div class="top-section">
      <ResourceDisplay />
    </div>
    <div class="main-content">
      <div class="left-section">
        <ManualActions />
      </div>
      <div class="right-section">
        <AutomationSection />
        <UpgradesSection />
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
}

.top-section {
  width: 100%;
  padding: 10px;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #e8e8e8;
}

.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f0f0;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
}
</style>
