<template>
  <div
    class="flex justify-between items-center bg-white p-5 rounded-xl shadow-lg max-w-4xl mx-auto gap-5 flex-col md:flex-row"
  >
    <div class="flex items-center gap-4">
      <div
        class="bg-blue-500 p-3 rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 transform transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-sm text-gray-600 font-medium">Simülasyon Zamanı</span>
        <h2 class="text-2xl text-gray-800 font-semibold font-mono m-0">{{ formattedTime }}</h2>
      </div>
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-sm text-gray-600 font-medium">Hız Kontrolü</label>
      <select
        v-model="selectedSpeed"
        @change="handleSpeedChange"
        class="p-2.5 border-2 border-gray-200 rounded-lg text-sm text-gray-800 bg-white cursor-pointer transition min-w-[200px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-blue-500"
      >
        <option :value="1">Normal Hız (1x)</option>
        <option :value="60">Hızlı (60x)</option>
        <option :value="120">Çok Hızlı (120x)</option>
        <option :value="3600">Ultra Hızlı (3600x)</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useFishStore } from '../stores/fishStore'

const fishStore = useFishStore()

// Returns formatted time string from digital clock
const formattedTime = computed(() =>
  fishStore.digitalClock.toLocaleTimeString('en-US', { hour12: false })
)

// Handles speed multiplier changes
const selectedSpeed = computed({
  get: () => fishStore.speedMultiplier,
  set: (value) => fishStore.setSpeed(value),
})

// Starts the clock when component is mounted
onMounted(() => {
  fishStore.startClock()
})

// Stops the clock when component is unmounted
onUnmounted(() => {
  fishStore.stopClock()
})

// Updates simulation speed when selection changes
const handleSpeedChange = () => {
  fishStore.setSpeed(selectedSpeed.value)
}
</script>

<style scoped>
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.clock-icon svg {
  animation: pulse 2s infinite ease-in-out;
}
</style>
