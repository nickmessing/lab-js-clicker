<script setup lang="ts">
import { ref } from 'vue'
import ResourceDisplay from './ResourceDisplay.vue'
import ManualActions from './ManualActions.vue'
import AutomationSection from './AutomationSection.vue'
import UpgradesSection from './UpgradesSection.vue'

type MobileTab = 'manual' | 'features'
const activeTab = ref<MobileTab>('manual')

function setTab(tab: MobileTab) {
  activeTab.value = tab
}

// Update active tab when window resizes
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    // If we switch to desktop view, we can reset the tab
    if (window.innerWidth >= 768) {
      activeTab.value = 'manual'
    }
  })
}
</script>

<template>
  <div class="game-layout">
    <!-- Resource display always at top -->
    <ResourceDisplay class="resource-display" />

    <!-- Mobile tab navigation -->
    <div class="mobile-tabs">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'manual' }"
        @click="setTab('manual')"
      >
        Manual Actions
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'features' }"
        @click="setTab('features')"
      >
        Upgrades & Automation
      </button>
    </div>

    <div class="game-content">
      <!-- Manual Actions section -->
      <div class="manual-section" :class="{ 'mobile-hidden': activeTab !== 'manual' }">
        <ManualActions />
      </div>

      <!-- Features section (Automation & Upgrades) -->
      <div class="features-section" :class="{ 'mobile-hidden': activeTab !== 'features' }">
        <AutomationSection />
        <UpgradesSection />
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 15px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px;
}

.resource-display {
  width: 100%;
}

.game-content {
  display: flex;
  flex: 1;
  gap: 15px;
  overflow: auto;
}

.manual-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.features-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mobile-tabs {
  display: none;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 10px;
}

.tab-button {
  flex: 1;
  padding: 10px;
  background-color: #d7ccc8;
  border: none;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tab-button.active {
  background-color: #a1887f;
  color: white;
}

.tab-button:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.tab-button:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

@media (max-width: 767px) {
  .game-content {
    flex-direction: column;
  }

  .mobile-tabs {
    display: flex;
  }

  .manual-section,
  .features-section {
    width: 100%;
  }

  .mobile-hidden {
    display: none;
  }
}
</style>
