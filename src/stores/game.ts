import { useFormattedCurrency } from '@/composables/useFormattedCurrency'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

type UpgradeType = 'manual' | 'storage' | 'automation'

interface Upgrade {
  id: string
  name: string
  description: string
  type: UpgradeType
  level: number
  baseCost: number
  costMultiplier: number
  getEffect: (level: number) => number
  formatEffect: (effect: number) => string
}

interface DetailedUpgrade extends Upgrade {
  effect: number
  formattedEffect: string
  nextLevel: number
  nextEffect: number
  formattedNextEffect: string
  cost: number
}

type GameState = {
  money: number
  freshBeans: number
  roastedBeans: number
  coffeeCups: number
  beanBuyers: number
  autoRoasters: number
  autoBrewers: number
  baristas: number
  upgrades: Record<string, number> // id -> level
}

const COST_MULTIPLIER = 1.1 // Reduced from 1.15 for gentler scaling
const UPGRADE_COST_MULTIPLIER = 1.35 // Reduced from 1.5 for more affordable upgrades

const TICK_INTERVAL = 16

// Reduce the costs and increase the production rates of automation units
const BASE_BEAN_BUYER_COST = 10 // Reduced from 15
const BASE_BEAN_BUYER_RATE = 0.75 // Increased from 0.5 (Fresh Beans per second per buyer)

const BASE_AUTO_ROASTER_COST = 25 // Reduced from 40
const BASE_AUTO_ROASTER_RATE = 0.7 // Increased from 0.5 (Roasted Beans per second per roaster)

const BASE_AUTO_BREWER_COST = 70 // Reduced from 100
const BASE_AUTO_BREWER_RATE = 0.3 // Increased from 0.2 (Coffee Cups per second per brewer)

const BASE_BARISTA_COST = 150 // Reduced from 250
const BASE_BARISTA_RATE = 0.3 // Increased from 0.2 (Coffee Cups sold per second per barista)

// Make manual actions more rewarding
const BASE_FRESH_BEANS_PRICE = 0.08 // Reduced from 0.1
const BASE_FRESH_BEANS_AMOUNT = 2 // Increased from 1

// Increase storage capacities
const BASE_MAXIMUM_FRESH_BEANS = 150 // Increased from 100
const BASE_MAXIMUM_ROASTED_BEANS = 75 // Increased from 50
const BASE_MAXIMUM_COFFEE_CUPS = 20 // Increased from 10

// Optimize production chain
const BASE_FRESH_BEANS_FOR_ROAST = 1
const BASE_ROASTED_BEANS_PER_ROAST = 2 // Increased from 1
const BASE_ROASTED_BEANS_FOR_BREW = 8 // Reduced from 10
const BASE_COFFEE_CUPS_PER_BREW = 1
const BASE_COFFEE_CUPS_FOR_POUR = 1
const BASE_MONEY_PER_COFFEE_CUP = 3 // Increased from 2

const TICK_PROPORTION = TICK_INTERVAL / 1000

const defaultGameState: GameState = {
  money: 15, // Increased starting money from 5
  freshBeans: 10, // Start with some beans
  roastedBeans: 0,
  coffeeCups: 0,
  beanBuyers: 0,
  autoRoasters: 0,
  autoBrewers: 0,
  baristas: 0,
  upgrades: {}, // All upgrades start at level 0
}

const UPGRADES: Upgrade[] = [
  // Manual Upgrades - reduced costs & increased effects
  {
    id: 'faster_clicking',
    name: 'Ergonomic Mouse',
    description: 'Increases the amount of Fresh Beans added per click',
    type: 'manual',
    level: 0,
    baseCost: 15, // Reduced from 25
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 2, // Doubled effect
    formatEffect: (effect) => `+${effect} Bean${effect !== 1 ? 's' : ''}/Click`,
  },
  {
    id: 'bulk_contracts',
    name: 'Bulk Bean Contracts',
    description: 'Decreases the cost of beans when buying manually',
    type: 'manual',
    level: 0,
    baseCost: 30, // Reduced from 50
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 0.07, // Increased from 0.05
    formatEffect: (effect) => `-${Math.round(effect * 100)}% Cost`,
  },
  {
    id: 'roasting_technique',
    name: 'Manual Roasting Technique',
    description: 'Increases the amount of Roasted Beans produced per click',
    type: 'manual',
    level: 0,
    baseCost: 60, // Reduced from 100
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 2, // Doubled effect
    formatEffect: (effect) => `+${effect} Roasted Bean${effect !== 1 ? 's' : ''}/Click`,
  },
  {
    id: 'efficient_brewing',
    name: 'Efficient Manual Brewing',
    description: 'Decreases the amount of Roasted Beans required per cup',
    type: 'manual',
    level: 0,
    baseCost: 90, // Reduced from 150
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 1.5, // Increased effect
    formatEffect: (effect) => `-${effect} Bean${effect !== 1 ? 's' : ''} Required`,
  },
  {
    id: 'premium_blend',
    name: 'Premium Blend',
    description: 'Increases the Money earned per cup when pouring coffee',
    type: 'manual',
    level: 0,
    baseCost: 120, // Reduced from 200
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 0.3, // Increased from 0.2
    formatEffect: (effect) => `+$${effect.toFixed(2)}/Cup`,
  },

  // Storage Upgrades - increased effects
  {
    id: 'bigger_bean_sacks',
    name: 'Bigger Bean Sacks',
    description: 'Increases the maximum storage capacity for Fresh Beans',
    type: 'storage',
    level: 0,
    baseCost: 45, // Reduced from 75
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 75, // Increased from 50
    formatEffect: (effect) => `+${effect} Capacity`,
  },
  {
    id: 'airtight_hoppers',
    name: 'Airtight Hoppers',
    description: 'Increases the maximum storage capacity for Roasted Beans',
    type: 'storage',
    level: 0,
    baseCost: 60, // Reduced from 100
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 40, // Increased from 25
    formatEffect: (effect) => `+${effect} Capacity`,
  },
  {
    id: 'more_pots',
    name: 'Thermal Urns',
    description: 'Increases the maximum storage capacity for Brewed Coffee',
    type: 'storage',
    level: 0,
    baseCost: 75, // Reduced from 125
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 8, // Increased from 5
    formatEffect: (effect) => `+${effect} Cup${effect !== 1 ? 's' : ''} Capacity`,
  },

  // Automation Upgrades - increased effects
  {
    id: 'bean_buyer_logistics',
    name: 'Bean Buyer Logistics',
    description: 'Increases the rate at which Bean Buyers generate Fresh Beans',
    type: 'automation',
    level: 0,
    baseCost: 180, // Reduced from 300
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 0.15, // Increased from 0.1
    formatEffect: (effect) => `+${Math.round(effect * 100)}% Rate`,
  },
  {
    id: 'auto_roaster_calibration',
    name: 'Auto-Roaster Calibration',
    description: 'Increases the rate at which Auto-Roasters convert Fresh Beans into Roasted Beans',
    type: 'automation',
    level: 0,
    baseCost: 400,
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 0.1,
    formatEffect: (effect) => `+${Math.round(effect * 100)}% Rate`,
  },
  {
    id: 'auto_brewer_efficiency',
    name: 'Auto-Brewer Efficiency',
    description: 'Decreases the amount of Roasted Beans required per cup brewed by Auto-Brewers',
    type: 'automation',
    level: 0,
    baseCost: 500,
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 0.05,
    formatEffect: (effect) => `-${Math.round(effect * 100)}% Bean Cost`,
  },
  {
    id: 'high_capacity_brewers',
    name: 'High-Capacity Auto-Brewers',
    description: 'Increases the rate at which Auto-Brewers produce Coffee Cups',
    type: 'automation',
    level: 0,
    baseCost: 600,
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 0.1,
    formatEffect: (effect) => `+${Math.round(effect * 100)}% Rate`,
  },
  {
    id: 'barista_training',
    name: 'Barista Training',
    description: 'Increases the Money earned per cup sold by Baristas',
    type: 'automation',
    level: 0,
    baseCost: 700,
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 0.05,
    formatEffect: (effect) => `+${Math.round(effect * 100)}% $/Cup`,
  },
  {
    id: 'faster_robot_arms',
    name: 'Faster Robot Arms',
    description: 'Increases the rate at which Baristas sell Coffee Cups',
    type: 'automation',
    level: 0,
    baseCost: 800,
    costMultiplier: UPGRADE_COST_MULTIPLIER,
    getEffect: (level) => level * 0.1,
    formatEffect: (effect) => `+${Math.round(effect * 100)}% Rate`,
  },
]

export const useGameStore = defineStore('game', () => {
  const initialGameStateString = localStorage.getItem('coffeeGameState')
  const initialGameState = initialGameStateString
    ? {
        ...defaultGameState,
        ...JSON.parse(initialGameStateString),
      }
    : (defaultGameState as GameState)

  const gameState = ref<GameState>(initialGameState)

  useIntervalFn(() => {
    localStorage.setItem('coffeeGameState', JSON.stringify(gameState.value))
  }, 10000)

  const money = computed(() => gameState.value.money)
  const freshBeans = computed(() => gameState.value.freshBeans)
  const roastedBeans = computed(() => gameState.value.roastedBeans)
  const coffeeCups = computed(() => gameState.value.coffeeCups)

  const formattedMoney = useFormattedCurrency(money)
  const formattedFreshBeans = computed(() => String(Math.floor(freshBeans.value)))
  const formattedRoastedBeans = computed(() => String(Math.floor(roastedBeans.value)))
  const formattedCoffeeCups = computed(() => String(Math.floor(coffeeCups.value * 10) / 10))

  const maximumFreshBeans = computed(
    () => BASE_MAXIMUM_FRESH_BEANS + getUpgradeEffect('bigger_bean_sacks'),
  )
  const maximumRoastedBeans = computed(
    () => BASE_MAXIMUM_ROASTED_BEANS + getUpgradeEffect('airtight_hoppers'),
  )
  const maximumCoffeeCups = computed(() => BASE_MAXIMUM_COFFEE_CUPS + getUpgradeEffect('more_pots'))

  const buyFreshBeansPrice = computed(() => {
    const discount = getUpgradeEffect('bulk_contracts')
    return BASE_FRESH_BEANS_PRICE * (1 - discount)
  })
  const buyFreshBeansAmount = computed(
    () => BASE_FRESH_BEANS_AMOUNT + getUpgradeEffect('faster_clicking'),
  )

  const freshBeansForRoast = computed(() => BASE_FRESH_BEANS_FOR_ROAST)
  const roastedBeansPerRoast = computed(
    () => BASE_ROASTED_BEANS_PER_ROAST + getUpgradeEffect('roasting_technique'),
  )

  const roastedBeansForBrew = computed(() => {
    const reduction = getUpgradeEffect('efficient_brewing')
    return Math.max(1, BASE_ROASTED_BEANS_FOR_BREW - reduction)
  })
  const coffeeCupsPerBrew = computed(() => BASE_COFFEE_CUPS_PER_BREW)
  const coffeeCupsForPour = computed(() => BASE_COFFEE_CUPS_FOR_POUR)
  const moneyPerCoffeeCup = computed(
    () => BASE_MONEY_PER_COFFEE_CUP + getUpgradeEffect('premium_blend'),
  )

  const canBuyFreshBeans = computed(
    () =>
      gameState.value.money >= buyFreshBeansPrice.value &&
      gameState.value.freshBeans + buyFreshBeansAmount.value <= maximumFreshBeans.value,
  )
  function buyFreshBeans() {
    if (!canBuyFreshBeans.value) return

    gameState.value.money -= buyFreshBeansPrice.value
    gameState.value.freshBeans = Math.min(
      gameState.value.freshBeans + buyFreshBeansAmount.value,
      maximumFreshBeans.value,
    )
  }

  const canRoastBeans = computed(
    () =>
      gameState.value.freshBeans >= freshBeansForRoast.value &&
      gameState.value.roastedBeans + roastedBeansPerRoast.value <= maximumRoastedBeans.value,
  )
  function roastBeans() {
    if (!canRoastBeans.value) return

    gameState.value.freshBeans -= freshBeansForRoast.value
    gameState.value.roastedBeans = Math.min(
      gameState.value.roastedBeans + roastedBeansPerRoast.value,
      maximumRoastedBeans.value,
    )
  }

  const canBrewCoffee = computed(
    () =>
      gameState.value.roastedBeans >= roastedBeansForBrew.value &&
      gameState.value.coffeeCups + coffeeCupsPerBrew.value <= maximumCoffeeCups.value,
  )
  function brewCoffee() {
    if (!canBrewCoffee.value) return

    gameState.value.roastedBeans -= roastedBeansForBrew.value
    gameState.value.coffeeCups = Math.min(
      gameState.value.coffeeCups + coffeeCupsPerBrew.value,
      maximumCoffeeCups.value,
    )
  }

  const canPourCoffee = computed(() => gameState.value.coffeeCups >= coffeeCupsForPour.value)
  function pourCoffee() {
    if (!canPourCoffee.value) return

    gameState.value.coffeeCups -= coffeeCupsForPour.value
    gameState.value.money += moneyPerCoffeeCup.value
  }

  const beanBuyers = computed(() => gameState.value.beanBuyers)
  const autoRoasters = computed(() => gameState.value.autoRoasters)
  const autoBrewers = computed(() => gameState.value.autoBrewers)
  const baristas = computed(() => gameState.value.baristas)

  const nextBeanBuyerCost = computed(() =>
    Math.ceil(BASE_BEAN_BUYER_COST * COST_MULTIPLIER ** gameState.value.beanBuyers),
  )
  const nextAutoRoasterCost = computed(() =>
    Math.ceil(BASE_AUTO_ROASTER_COST * COST_MULTIPLIER ** gameState.value.autoRoasters),
  )
  const nextAutoBrewerCost = computed(() =>
    Math.ceil(BASE_AUTO_BREWER_COST * COST_MULTIPLIER ** gameState.value.autoBrewers),
  )
  const nextBaristaCost = computed(() =>
    Math.ceil(BASE_BARISTA_COST * COST_MULTIPLIER ** gameState.value.baristas),
  )

  const beanBuyerProductionRate = computed(() => {
    const baseRate = BASE_BEAN_BUYER_RATE * gameState.value.beanBuyers
    const multiplier = 1 + getUpgradeEffect('bean_buyer_logistics')
    return baseRate * multiplier
  })

  const freshBeansPerTickFromBuyers = computed(
    () => beanBuyerProductionRate.value * TICK_PROPORTION,
  )
  const freshBeansPerTickPrice = computed(
    () => freshBeansPerTickFromBuyers.value * buyFreshBeansPrice.value,
  )

  const canBuyBeanBuyer = computed(() => gameState.value.money >= nextBeanBuyerCost.value)

  function buyBeanBuyer() {
    if (!canBuyBeanBuyer.value) return

    gameState.value.money -= nextBeanBuyerCost.value
    gameState.value.beanBuyers += 1
  }

  function beanBuyerTick() {
    // Don't proceed if we can't afford beans or if adding would exceed capacity
    if (
      freshBeansPerTickPrice.value > gameState.value.money ||
      gameState.value.freshBeans + freshBeansPerTickFromBuyers.value > maximumFreshBeans.value
    )
      return

    // If we'd exceed the maximum, only buy what would fit
    const amountToBuy = Math.min(
      freshBeansPerTickFromBuyers.value,
      maximumFreshBeans.value - gameState.value.freshBeans,
    )

    // Calculate adjusted cost for the actual amount we're buying
    const adjustedCost =
      (amountToBuy / freshBeansPerTickFromBuyers.value) * freshBeansPerTickPrice.value

    gameState.value.money -= adjustedCost
    gameState.value.freshBeans += amountToBuy
  }

  // Auto Roaster automation
  const autoRoasterProductionRate = computed(() => {
    const baseRate = BASE_AUTO_ROASTER_RATE * gameState.value.autoRoasters
    const multiplier = 1 + getUpgradeEffect('auto_roaster_calibration')
    return baseRate * multiplier
  })
  const roastedBeansPerTickFromRoasters = computed(
    () => autoRoasterProductionRate.value * TICK_PROPORTION,
  )
  const freshBeansPerTickForRoasters = computed(
    () =>
      roastedBeansPerTickFromRoasters.value *
      (freshBeansForRoast.value / roastedBeansPerRoast.value),
  )
  const canBuyAutoRoaster = computed(() => gameState.value.money >= nextAutoRoasterCost.value)
  function buyAutoRoaster() {
    if (!canBuyAutoRoaster.value) return
    gameState.value.money -= nextAutoRoasterCost.value
    gameState.value.autoRoasters += 1
  }
  function autoRoasterTick() {
    // Calculate how many fresh beans we would use this tick
    const desiredFreshBeans = freshBeansPerTickForRoasters.value

    // If we don't have enough fresh beans or would exceed roasted beans capacity, return
    if (desiredFreshBeans > gameState.value.freshBeans) return

    // Calculate how many roasted beans we would produce
    const potentialRoastedProduced =
      desiredFreshBeans * (roastedBeansPerRoast.value / freshBeansForRoast.value)

    // Check if adding the roasted beans would exceed maximum
    if (gameState.value.roastedBeans + potentialRoastedProduced > maximumRoastedBeans.value) {
      // Calculate the maximum amount we can produce without exceeding capacity
      const maxRoastedToAdd = maximumRoastedBeans.value - gameState.value.roastedBeans
      // Calculate the corresponding fresh beans to use
      const freshBeansToUse =
        maxRoastedToAdd / (roastedBeansPerRoast.value / freshBeansForRoast.value)

      gameState.value.freshBeans -= freshBeansToUse
      gameState.value.roastedBeans = maximumRoastedBeans.value
      return
    }

    // Otherwise process normally
    gameState.value.freshBeans -= desiredFreshBeans
    gameState.value.roastedBeans += potentialRoastedProduced
  }

  // Auto Brewer automation
  const autoBrewerProductionRate = computed(() => {
    const baseRate = BASE_AUTO_BREWER_RATE * gameState.value.autoBrewers
    const multiplier = 1 + getUpgradeEffect('high_capacity_brewers')
    return baseRate * multiplier
  })
  const coffeeCupsPerTickFromBrewers = computed(
    () => autoBrewerProductionRate.value * TICK_PROPORTION,
  )
  const roastedBeansPerTickForBrewers = computed(() => {
    const brewersConsumption =
      coffeeCupsPerTickFromBrewers.value * (roastedBeansForBrew.value / coffeeCupsPerBrew.value)
    // Apply auto-brewer efficiency upgrade
    const efficiencyReduction = getUpgradeEffect('auto_brewer_efficiency')
    return brewersConsumption * (1 - efficiencyReduction)
  })
  const canBuyAutoBrewer = computed(() => gameState.value.money >= nextAutoBrewerCost.value)
  function buyAutoBrewer() {
    if (!canBuyAutoBrewer.value) return
    gameState.value.money -= nextAutoBrewerCost.value
    gameState.value.autoBrewers += 1
  }
  function autoBrewerTick() {
    // Calculate how many roasted beans we would use this tick
    const desiredRoastedBeans = roastedBeansPerTickForBrewers.value

    // If we don't have enough roasted beans, return
    if (desiredRoastedBeans > gameState.value.roastedBeans) return

    // Calculate how many coffee cups we would produce
    const potentialCoffeeCupsProduced =
      desiredRoastedBeans * (coffeeCupsPerBrew.value / roastedBeansForBrew.value)

    // Check if adding the coffee cups would exceed maximum
    if (gameState.value.coffeeCups + potentialCoffeeCupsProduced > maximumCoffeeCups.value) {
      // Calculate the maximum amount we can produce without exceeding capacity
      const maxCupsToAdd = maximumCoffeeCups.value - gameState.value.coffeeCups
      // Calculate the corresponding roasted beans to use
      const roastedBeansToUse = maxCupsToAdd / (coffeeCupsPerBrew.value / roastedBeansForBrew.value)

      gameState.value.roastedBeans -= roastedBeansToUse
      gameState.value.coffeeCups = maximumCoffeeCups.value
      return
    }

    // Otherwise process normally
    gameState.value.roastedBeans -= desiredRoastedBeans
    gameState.value.coffeeCups += potentialCoffeeCupsProduced
  }

  // Barista automation
  const baristaProductionRate = computed(() => {
    const baseRate = BASE_BARISTA_RATE * gameState.value.baristas
    const multiplier = 1 + getUpgradeEffect('faster_robot_arms')
    return baseRate * multiplier
  })
  const coffeeCupsPerTickFromBaristas = computed(
    () => baristaProductionRate.value * TICK_PROPORTION,
  )
  const canBuyBarista = computed(() => gameState.value.money >= nextBaristaCost.value)
  function buyBarista() {
    if (!canBuyBarista.value) return
    gameState.value.money -= nextBaristaCost.value
    gameState.value.baristas += 1
  }
  function baristaTick() {
    if (coffeeCupsPerTickFromBaristas.value > gameState.value.coffeeCups) return

    const availableCoffeeCups = Math.min(
      coffeeCupsPerTickFromBaristas.value,
      gameState.value.coffeeCups,
    )

    // Apply barista training upgrade to increase money per cup
    const baristaBoost = 1 + getUpgradeEffect('barista_training')
    const moneyEarned = availableCoffeeCups * moneyPerCoffeeCup.value * baristaBoost

    gameState.value.coffeeCups -= availableCoffeeCups
    gameState.value.money += moneyEarned
  }

  function tick() {
    beanBuyerTick()
    autoRoasterTick()
    autoBrewerTick()
    baristaTick()
  }

  useIntervalFn(tick, TICK_INTERVAL)

  // Upgrade-related computed properties and functions
  const upgrades = computed<DetailedUpgrade[]>(() => {
    return UPGRADES.map((upgrade) => {
      const level = gameState.value.upgrades[upgrade.id] || 0
      const effect = upgrade.getEffect(level)
      return {
        ...upgrade,
        level,
        effect,
        formattedEffect: upgrade.formatEffect(effect),
        nextLevel: level + 1,
        nextEffect: upgrade.getEffect(level + 1),
        formattedNextEffect: upgrade.formatEffect(upgrade.getEffect(level + 1)),
        cost: Math.ceil(upgrade.baseCost * upgrade.costMultiplier ** level),
      }
    })
  })

  const upgradesByType = computed(() => {
    const result: Record<UpgradeType, DetailedUpgrade[]> = {
      manual: [],
      storage: [],
      automation: [],
    }

    upgrades.value.forEach((upgrade) => {
      result[upgrade.type].push(upgrade)
    })

    return result
  })

  function getUpgradeLevel(id: string): number {
    return gameState.value.upgrades[id] || 0
  }

  function getUpgradeEffect(id: string): number {
    const upgrade = UPGRADES.find((u) => u.id === id)
    if (!upgrade) return 0
    return upgrade.getEffect(getUpgradeLevel(id))
  }

  function getUpgradeCost(id: string): number {
    const upgrade = UPGRADES.find((u) => u.id === id)
    if (!upgrade) return Infinity
    const level = getUpgradeLevel(id)
    return Math.ceil(upgrade.baseCost * upgrade.costMultiplier ** level)
  }

  function canBuyUpgrade(id: string): boolean {
    return gameState.value.money >= getUpgradeCost(id)
  }

  function buyUpgrade(id: string): void {
    const cost = getUpgradeCost(id)
    if (gameState.value.money < cost) return

    gameState.value.money -= cost
    gameState.value.upgrades[id] = (gameState.value.upgrades[id] || 0) + 1
  }

  return {
    gameState,
    money,
    freshBeans,
    roastedBeans,
    coffeeCups,
    formattedMoney,
    formattedFreshBeans,
    formattedRoastedBeans,
    formattedCoffeeCups,

    maximumFreshBeans,
    maximumRoastedBeans,
    maximumCoffeeCups,

    buyFreshBeansPrice,
    buyFreshBeansAmount,
    freshBeansForRoast,
    roastedBeansPerRoast,
    roastedBeansForBrew,
    coffeeCupsPerBrew,
    coffeeCupsForPour,
    moneyPerCoffeeCup,

    canBuyFreshBeans,
    buyFreshBeans,

    canRoastBeans,
    roastBeans,

    canBrewCoffee,
    brewCoffee,

    canPourCoffee,
    pourCoffee,

    beanBuyers,
    autoRoasters,
    autoBrewers,
    baristas,

    nextBeanBuyerCost,
    nextAutoRoasterCost,
    nextAutoBrewerCost,
    nextBaristaCost,

    beanBuyerProductionRate,
    autoRoasterProductionRate,
    autoBrewerProductionRate,
    baristaProductionRate,

    canBuyBeanBuyer,
    canBuyAutoRoaster,
    canBuyAutoBrewer,
    canBuyBarista,

    buyBeanBuyer,
    buyAutoRoaster,
    buyAutoBrewer,
    buyBarista,

    // Export upgrades-related properties and methods
    upgrades,
    upgradesByType,
    getUpgradeLevel,
    getUpgradeEffect,
    getUpgradeCost,
    canBuyUpgrade,
    buyUpgrade,
  }
})
