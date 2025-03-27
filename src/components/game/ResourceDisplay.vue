<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed } from 'vue'
import { useFormattedCurrency } from '@/composables/useFormattedCurrency'

const gameStore = useGameStore()

const moneyRate = computed(() => {
  // Money from baristas minus cost from bean buyers
  return (
    gameStore.baristaProductionRate -
    gameStore.beanBuyerProductionRate * gameStore.buyFreshBeansPrice
  )
})

const formattedMoneyRate = useFormattedCurrency(moneyRate)

const freshBeansRate = computed(() => {
  // Beans from buyers minus beans used by roasters
  return (
    gameStore.beanBuyerProductionRate -
    gameStore.autoRoasterProductionRate *
      (gameStore.freshBeansForRoast / gameStore.roastedBeansPerRoast)
  )
})

const roastedBeansRate = computed(() => {
  // Roasted beans from roasters minus beans used by brewers
  return (
    gameStore.autoRoasterProductionRate -
    gameStore.autoBrewerProductionRate *
      (gameStore.roastedBeansForBrew / gameStore.coffeeCupsPerBrew)
  )
})

const coffeeCupsRate = computed(() => {
  // Coffee cups from brewers minus cups sold by baristas
  return gameStore.autoBrewerProductionRate - gameStore.baristaProductionRate
})
</script>

<template>
  <div class="resource-bar">
    <div class="resource money">
      <div class="resource-label">Money:</div>
      <div class="resource-value">{{ gameStore.formattedMoney }}</div>
      <div class="resource-rate" :class="{ positive: moneyRate > 0, negative: moneyRate < 0 }">
        {{ moneyRate > 0 ? '+' : '' }}{{ formattedMoneyRate }}/s
      </div>
    </div>
    <div class="resource beans">
      <div class="resource-label">Fresh Beans:</div>
      <div class="resource-value">
        {{ gameStore.formattedFreshBeans }} / {{ gameStore.maximumFreshBeans }}
      </div>
      <div
        class="resource-rate"
        :class="{ positive: freshBeansRate > 0, negative: freshBeansRate < 0 }"
      >
        {{ freshBeansRate > 0 ? '+' : '' }}{{ freshBeansRate.toFixed(1) }}/s
      </div>
    </div>
    <div class="resource roasted">
      <div class="resource-label">Roasted Beans:</div>
      <div class="resource-value">
        {{ gameStore.formattedRoastedBeans }} / {{ gameStore.maximumRoastedBeans }}
      </div>
      <div
        class="resource-rate"
        :class="{ positive: roastedBeansRate > 0, negative: roastedBeansRate < 0 }"
      >
        {{ roastedBeansRate > 0 ? '+' : '' }}{{ roastedBeansRate.toFixed(1) }}/s
      </div>
    </div>
    <div class="resource coffee">
      <div class="resource-label">Brewed Coffee:</div>
      <div class="resource-value">
        {{ gameStore.formattedCoffeeCups }} / {{ gameStore.maximumCoffeeCups }} Cups
      </div>
      <div
        class="resource-rate"
        :class="{ positive: coffeeCupsRate > 0, negative: coffeeCupsRate < 0 }"
      >
        {{ coffeeCupsRate > 0 ? '+' : '' }}{{ coffeeCupsRate.toFixed(1) }}/s
      </div>
    </div>
  </div>
</template>

<style scoped>
.resource-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #333;
  color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.resource {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 15px;
}

.resource-label {
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.resource-value {
  font-size: 1.1rem;
}

.resource-rate {
  font-size: 0.75rem;
  font-style: italic;
}

.positive {
  color: #4caf50;
}

.negative {
  color: #f44336;
}

.money {
  color: #ffd700;
}

.beans {
  color: #8b4513;
}

.roasted {
  color: #a0522d;
}

.coffee {
  color: #d2b48c;
}

@media (max-width: 768px) {
  .resource-bar {
    flex-wrap: wrap;
  }

  .resource {
    width: 50%;
    padding: 5px;
  }
}

@media (max-width: 767px) {
  .resource-bar {
    flex-wrap: wrap;
    padding: 8px 5px;
  }

  .resource {
    width: 50%;
    padding: 5px;
  }

  .resource-value {
    font-size: 0.95rem;
  }

  .resource-rate {
    font-size: 0.7rem;
  }
}
</style>
