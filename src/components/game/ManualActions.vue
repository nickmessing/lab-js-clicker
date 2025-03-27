<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { useFormattedCurrency } from '@/composables/useFormattedCurrency'

const gameStore = useGameStore()

const formattedBuyPrice = useFormattedCurrency(() => gameStore.buyFreshBeansPrice)
const formattedPourReward = useFormattedCurrency(() => gameStore.moneyPerCoffeeCup)
</script>

<template>
  <div class="manual-actions">
    <h2>Manual Actions</h2>
    <div class="actions-container">
      <button
        class="action-button buy-beans"
        :disabled="!gameStore.canBuyFreshBeans"
        @click="gameStore.buyFreshBeans"
      >
        <div class="button-title">Buy Beans</div>
        <div class="button-cost">Cost: {{ formattedBuyPrice }}</div>
        <div class="button-reward">
          Gain: {{ gameStore.buyFreshBeansAmount }} Fresh Bean{{
            gameStore.buyFreshBeansAmount !== 1 ? 's' : ''
          }}
        </div>
      </button>

      <button
        class="action-button roast-beans"
        :disabled="!gameStore.canRoastBeans"
        @click="gameStore.roastBeans"
      >
        <div class="button-title">Roast Beans</div>
        <div class="button-cost">
          Cost: {{ gameStore.freshBeansForRoast }} Fresh Bean{{
            gameStore.freshBeansForRoast !== 1 ? 's' : ''
          }}
        </div>
        <div class="button-reward">
          Gain: {{ gameStore.roastedBeansPerRoast }} Roasted Bean{{
            gameStore.roastedBeansPerRoast !== 1 ? 's' : ''
          }}
        </div>
      </button>

      <button
        class="action-button brew-coffee"
        :disabled="!gameStore.canBrewCoffee"
        @click="gameStore.brewCoffee"
      >
        <div class="button-title">Brew Coffee</div>
        <div class="button-cost">Cost: {{ gameStore.roastedBeansForBrew }} Roasted Beans</div>
        <div class="button-reward">
          Gain: {{ gameStore.coffeeCupsPerBrew }} Coffee Cup{{
            gameStore.coffeeCupsPerBrew !== 1 ? 's' : ''
          }}
        </div>
      </button>

      <button
        class="action-button pour-coffee"
        :disabled="!gameStore.canPourCoffee"
        @click="gameStore.pourCoffee"
      >
        <div class="button-title">Pour Coffee</div>
        <div class="button-cost">
          Cost: {{ gameStore.coffeeCupsForPour }} Coffee Cup{{
            gameStore.coffeeCupsForPour !== 1 ? 's' : ''
          }}
        </div>
        <div class="button-reward gain">Earn: {{ formattedPourReward }}</div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.manual-actions {
  display: flex;
  flex-direction: column;
}

h2 {
  text-align: center;
  color: #5d4037;
  margin-bottom: 20px;
}

.actions-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.action-button {
  width: 80%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.1s ease;
}

.action-button:hover {
  transform: scale(1.03);
}

.action-button:active {
  transform: scale(0.97);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-button:disabled:hover {
  transform: none;
}

.button-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.button-cost {
  font-size: 0.9rem;
  color: #d32f2f;
}

.button-reward {
  font-size: 0.9rem;
  color: #388e3c;
}

.button-cost,
.button-reward {
  background: rgba(255, 255, 255, 0.4);
  width: 100%;
  padding: 5px;
}

.gain {
  color: #388e3c;
}

.buy-beans {
  background-color: #d7ccc8;
  color: #3e2723;
}

.roast-beans {
  background-color: #bcaaa4;
  color: #3e2723;
}

.brew-coffee {
  background-color: #a1887f;
  color: white;
}

.pour-coffee {
  background-color: #8d6e63;
  color: white;
}

@media (min-width: 768px) {
  .actions-container {
    max-width: 500px;
    margin: 0 auto;
  }
}
</style>
