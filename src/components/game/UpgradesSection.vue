<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { useFormattedCurrency } from '@/composables/useFormattedCurrency'
import { computed, ref } from 'vue'

const gameStore = useGameStore()
const activeTab = ref<'manual' | 'storage' | 'automation'>('manual')

const tabOptions = [
  { id: 'manual', label: 'Manual' },
  { id: 'storage', label: 'Storage' },
  { id: 'automation', label: 'Automation' },
]

const activeUpgrades = computed(() => {
  return gameStore.upgradesByType[activeTab.value]
})

function setActiveTab(tab: 'manual' | 'storage' | 'automation') {
  activeTab.value = tab
}

function formatCost(cost: number) {
  return useFormattedCurrency(() => cost).value
}
</script>

<template>
  <div class="upgrades-section">
    <h2>Upgrades</h2>

    <div class="upgrade-tabs">
      <div
        v-for="tab in tabOptions"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="setActiveTab(tab.id as 'manual' | 'storage' | 'automation')"
      >
        {{ tab.label }}
      </div>
    </div>

    <div class="upgrades-list">
      <div v-for="upgrade in activeUpgrades" :key="upgrade.id" class="upgrade-item">
        <div class="upgrade-info">
          <div class="upgrade-name">{{ upgrade.name }}</div>
          <div class="upgrade-effect">
            {{ upgrade.formattedNextEffect }}
          </div>
          <div class="upgrade-level">Level {{ upgrade.level }}</div>
          <div class="upgrade-description">{{ upgrade.description }}</div>
        </div>
        <button
          class="upgrade-button"
          :disabled="!gameStore.canBuyUpgrade(upgrade.id)"
          @click="gameStore.buyUpgrade(upgrade.id)"
        >
          Buy - Cost: {{ formatCost(upgrade.cost) }}
        </button>
      </div>

      <div v-if="activeUpgrades.length === 0" class="no-upgrades">
        No upgrades available in this category.
      </div>
    </div>
  </div>
</template>

<style scoped>
.upgrades-section {
  flex: 1;
  padding: 10px;
  background-color: #efebe9;
  border-radius: 8px;
}

h2 {
  text-align: center;
  color: #5d4037;
  margin-bottom: 15px;
}

.upgrade-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  gap: 10px;
}

.tab {
  padding: 8px 16px;
  background-color: #d7ccc8;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #5d4037;
}

.tab.active {
  background-color: #a1887f;
  color: white;
  font-weight: bold;
}

.upgrades-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.upgrade-item {
  background-color: #d7ccc8;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.upgrade-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.upgrade-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #3e2723;
}

.upgrade-effect {
  font-size: 0.9rem;
  color: #388e3c;
  font-weight: bold;
}

.upgrade-level {
  font-size: 0.85rem;
  color: #8d6e63;
}

.upgrade-description {
  font-size: 0.8rem;
  color: #5d4037;
  margin-top: 5px;
  max-width: 250px;
}

.upgrade-button {
  background-color: #8d6e63;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
}

.upgrade-button:hover {
  background-color: #795548;
}

.upgrade-button:disabled {
  background-color: #bbbbbb;
  cursor: not-allowed;
}

.upgrade-button:disabled:hover {
  background-color: #bbbbbb;
}

.no-upgrades {
  text-align: center;
  color: #5d4037;
  font-style: italic;
  padding: 20px;
}
</style>
