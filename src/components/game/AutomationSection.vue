<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { useFormattedCurrency } from '@/composables/useFormattedCurrency'
import { computed } from 'vue'

const gameStore = useGameStore()

const formattedBeanBuyerCost = useFormattedCurrency(computed(() => gameStore.nextBeanBuyerCost))
const formattedAutoRoasterCost = useFormattedCurrency(computed(() => gameStore.nextAutoRoasterCost))
const formattedAutoBrewerCost = useFormattedCurrency(computed(() => gameStore.nextAutoBrewerCost))
const formattedBaristaCost = useFormattedCurrency(computed(() => gameStore.nextBaristaCost))
</script>

<template>
  <div class="automation-section">
    <h2>Automation</h2>
    <div class="automation-list">
      <div class="automation-item">
        <div class="automation-info">
          <div class="automation-name">Bean Buyers</div>
          <div class="automation-count">Owned: {{ gameStore.beanBuyers }}</div>
          <div class="automation-rate">
            +{{ gameStore.beanBuyerProductionRate.toFixed(1) }} Beans/sec
          </div>
        </div>
        <button
          class="buy-button"
          :disabled="!gameStore.canBuyBeanBuyer"
          @click="gameStore.buyBeanBuyer"
        >
          Buy 1 - Cost: {{ formattedBeanBuyerCost }}
        </button>
      </div>

      <div class="automation-item">
        <div class="automation-info">
          <div class="automation-name">Auto-Roasters</div>
          <div class="automation-count">Owned: {{ gameStore.autoRoasters }}</div>
          <div class="automation-rate">
            +{{ gameStore.autoRoasterProductionRate.toFixed(1) }} Roasted/sec
          </div>
        </div>
        <button
          class="buy-button"
          :disabled="!gameStore.canBuyAutoRoaster"
          @click="gameStore.buyAutoRoaster"
        >
          Buy 1 - Cost: {{ formattedAutoRoasterCost }}
        </button>
      </div>

      <div class="automation-item">
        <div class="automation-info">
          <div class="automation-name">Auto-Brewers</div>
          <div class="automation-count">Owned: {{ gameStore.autoBrewers }}</div>
          <div class="automation-rate">
            +{{ gameStore.autoBrewerProductionRate.toFixed(1) }} Coffee/sec
          </div>
        </div>
        <button
          class="buy-button"
          :disabled="!gameStore.canBuyAutoBrewer"
          @click="gameStore.buyAutoBrewer"
        >
          Buy 1 - Cost: {{ formattedAutoBrewerCost }}
        </button>
      </div>

      <div class="automation-item">
        <div class="automation-info">
          <div class="automation-name">Baristas</div>
          <div class="automation-count">Owned: {{ gameStore.baristas }}</div>
          <div class="automation-rate">
            +{{ gameStore.baristaProductionRate.toFixed(1) }} Sales/sec
          </div>
        </div>
        <button
          class="buy-button"
          :disabled="!gameStore.canBuyBarista"
          @click="gameStore.buyBarista"
        >
          Buy 1 - Cost: {{ formattedBaristaCost }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.automation-section {
  flex: 1;
  padding: 10px;
  background-color: #efebe9;
  border-radius: 8px;
  margin-bottom: 15px;
}

h2 {
  text-align: center;
  color: #5d4037;
  margin-bottom: 15px;
}

.automation-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
}

.automation-item {
  background-color: #d7ccc8;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.automation-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.automation-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #3e2723;
}

.automation-count {
  font-size: 0.9rem;
  color: #5d4037;
}

.automation-rate {
  font-size: 0.85rem;
  color: #8d6e63;
}

.buy-button {
  background-color: #8d6e63;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
}

.buy-button:hover {
  background-color: #795548;
}

.buy-button:disabled {
  background-color: #bbbbbb;
  cursor: not-allowed;
}

.buy-button:disabled:hover {
  background-color: #bbbbbb;
}
</style>
