<template>
  <div class="aquarium-wrapper" @click="handleWrapperClick">
    <div class="w-3/4 mx-auto py-5">
      <div
        class="aquarium w-full h-[400px] relative overflow-visible rounded-[10px] shadow-[inset_0_0_50px_rgba(0,0,0,0.2)]"
      >
        <div
          class="absolute top-0 left-0 w-full h-full bg-center bg-cover rounded-[10px] opacity-90 aquarium-bg"
        ></div>
        <div class="relative w-full h-full rounded-[10px] z-[1] bg-water-gradient">
          <div
            v-for="fish in fishStore.fishList"
            :key="fish.id"
            class="fish"
            :class="[
              `fish-${fish.type.toLowerCase()}`,
              {
                dead: fish.healthStatus === 0,
                paused: fishStore.selectedFishId === fish.id,
                disabled: !!selectedFish,
              },
            ]"
            :style="fish.deathStyle"
            :data-id="fish.id"
            :title="`${fish.name} (${fish.type})`"
            @click="handleFishClick(fish)"
          >
            <img :src="fish.imageUrl" :alt="fish.type" class="w-full h-full object-contain" />
            <div class="fish-bubbles absolute top-0 left-[70px] transform origin-left z-20">
              <div
                v-for="n in 3"
                :key="n"
                class="fish-bubble"
                :style="{ '--delay': `${n * 0.5}s` }"
              ></div>
            </div>
          </div>
        </div>

        <fish-modal
          v-if="selectedFish"
          :fish="selectedFish"
          :isOpen="!!selectedFish"
          :position="modalPosition"
          @close="handleModalClose"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useFishStore } from '../stores/fishStore'
import FishModal from './FishModal.vue'

const fishStore = useFishStore()
const selectedFish = ref(null)
const modalPosition = ref({ x: 0, y: 0 })

// Handles click event on fish and shows modal
const handleFishClick = (fish) => {
  if (fish.healthStatus === 0) return

  const fishElement = document.querySelector(`.fish[data-id="${fish.id}"]`)
  const aquarium = document.querySelector('.aquarium')

  if (fishElement && aquarium) {
    const rect = fishElement.getBoundingClientRect()
    const aquariumRect = aquarium.getBoundingClientRect()

    const fishCenterX = rect.left + rect.width / 2
    const aquariumCenterX = aquariumRect.left + aquariumRect.width / 2

    const currentRotation = fishCenterX > aquariumCenterX ? '180deg' : '0deg'
    modalPosition.value = {
      x: rect.left - aquariumRect.left + rect.width / 2,
      y: rect.top - aquariumRect.top + rect.height / 2,
      aquariumWidth: aquariumRect.width,
    }

    fish.pauseStyle = {
      '--paused-rotation': currentRotation,
    }
  }

  if (fishStore.selectedFishId === fish.id) {
    fishStore.selectedFishId = null
    selectedFish.value = null
  } else {
    fishStore.selectedFishId = fish.id
    selectedFish.value = fish
  }
}

// Closes the fish modal and resets selection
const handleModalClose = () => {
  if (selectedFish.value) {
    handleFishClick(selectedFish.value)
    selectedFish.value = null
  }
}

// Handles fish death animation and positioning
const handleDeath = (fish) => {
  if (fish.healthStatus === 0 && !fish.deathStyle) {
    // Clear selected fish if the dying fish was selected
    if (fishStore.selectedFishId === fish.id) {
      fishStore.selectedFishId = null
      selectedFish.value = null
    }

    const fishElement = document.querySelector(`.fish[data-id="${fish.id}"]`)
    const aquarium = document.querySelector('.aquarium')

    if (fishElement) {
      const rect = fishElement.getBoundingClientRect()
      const aquariumRect = aquarium.getBoundingClientRect()

      const isFlipped = window.getComputedStyle(fishElement).transform.includes('180')
      const currentRotation = isFlipped ? '180deg' : '0deg'
      fish.deathStyle = {
        position: 'absolute',
        left: `${rect.left - aquariumRect.left + rect.width / 2}px !important`,
        transform: `rotateY(${currentRotation}) rotateZ(0deg)`,
        transition: 'none',
        animation: 'fishDeath 3s forwards',
        '--current-rotation': currentRotation,
      }
    }
  }
}

// Watches fish list for health changes and triggers death animation
watch(
  () => fishStore.fishList,
  (newList) => {
    newList.forEach((fish) => {
      if (fish.healthStatus === 0 && !fish.deathStyle) {
        handleDeath(fish)
      }
    })
  },
  { deep: true }
)

// Handles clicks on the wrapper to close modal
const handleWrapperClick = (event) => {
  if (selectedFish && !event.target.closest('.fish') && !event.target.closest('.modal-container')) {
    handleModalClose()
  }
}
</script>

<style scoped>
.aquarium-bg {
  background: url('@/assets/images/aquarium-bg.webp') center center/100% 100%;
}

.fish {
  position: absolute;
  width: 80px;
  height: 55px;
  cursor: pointer;
  transform-origin: center;
  animation: swim 20s infinite linear;
  will-change: transform, left, top;
}

.fish.dead {
  cursor: default !important;
  filter: grayscale(100%) brightness(70%) !important;
  z-index: 1 !important;
  pointer-events: none !important;
  transform-origin: center !important;
  animation: fishDeath 3s forwards !important;
  position: absolute !important;
  left: 50%;
  margin-left: -40px !important;
}

@keyframes swim {
  0% {
    left: 0;
    transform: rotateY(0deg);
  }
  45% {
    transform: rotateY(0deg);
  }
  50% {
    left: calc(100% - 80px);
    transform: rotateY(180deg);
  }
  95% {
    transform: rotateY(180deg);
  }
  100% {
    left: 0;
    transform: rotateY(0deg);
  }
}

.fish:nth-child(1) {
  animation-delay: 0s;
  top: 65%;
}
.fish:nth-child(2) {
  animation-delay: -4s;
  top: 45%;
}
.fish:nth-child(3) {
  animation-delay: -2s;
  top: 35%;
}
.fish:nth-child(4) {
  animation-delay: -6s;
  top: 55%;
}
.fish:nth-child(5) {
  animation-delay: -3s;
  top: 75%;
}

.fish[style*='rotateY(180deg)'] .fish-bubbles {
  left: auto;
  right: 5px;
  transform-origin: right center;
}

.fish-bubble {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  margin: 3px;
  animation: bubble 2s infinite;
  opacity: 0;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
}

@keyframes bubble {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  20% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(20px, -20px) scale(0.5);
    opacity: 0;
  }
}

.fish[style*='rotateY(180deg)'] .fish-bubble {
  animation-name: bubbleReverse;
}

@keyframes bubbleReverse {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  20% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-20px, -20px) scale(0.5);
    opacity: 0;
  }
}

.fish-bubble:nth-child(1) {
  animation-delay: 0s;
}
.fish-bubble:nth-child(2) {
  animation-delay: 0.7s;
}
.fish-bubble:nth-child(3) {
  animation-delay: 1.4s;
}

.paused {
  animation-play-state: paused !important;
  transform: rotateY(var(--paused-rotation)) !important;
  z-index: 10;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
}

@keyframes fishDeath {
  0% {
    transform: rotateY(var(--current-rotation)) rotateZ(0deg);
    opacity: 1;
  }
  50% {
    transform: rotateY(var(--current-rotation)) rotateZ(-45deg);
    opacity: 0.7;
    top: 70%;
  }
  100% {
    transform: rotateY(var(--current-rotation)) rotateZ(-90deg);
    opacity: 0.5;
    top: calc(100% - 55px);
  }
}

.fish.dead:not([style*='animation']) {
  animation: none !important;
  top: calc(100% - 55px) !important;
  transform: rotateY(var(--current-rotation)) rotateZ(-90deg) !important;
}

.fish.disabled {
  pointer-events: none;
  cursor: default;
}
</style>
