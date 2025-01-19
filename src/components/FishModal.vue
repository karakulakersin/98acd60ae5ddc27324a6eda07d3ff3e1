<template>
  <Transition name="modal-fade">
    <div
      v-if="isOpen"
      class="modal-container fixed bg-white p-4 rounded-lg shadow-lg z-50 min-w-[300px] w-[300px]"
      :style="modalPosition"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">{{ fish.name }} ({{ fish.type }})</h2>
        <button
          class="text-2xl text-gray-600 hover:text-gray-800 transition-colors"
          @click="closeModal"
        >
          &times;
        </button>
      </div>

      <div class="space-y-4">
        <div class="flex gap-5">
          <img :src="fish.imageUrl" :alt="fish.type" class="w-[50px] h-auto object-contain" />
          <div class="flex-1 space-y-2">
            <p>
              <span class="font-semibold">Ağırlık:</span>
              {{ fish.weight.toFixed(2) }}g
            </p>
            <p>
              <span class="font-semibold">Sağlık Durumu:</span>
              <span
                :class="[
                  'ml-2 px-2 py-1 rounded-full text-sm',
                  {
                    'bg-green-100 text-green-800': fishStore.getHealthClass(fish) === 'health-good',
                    'bg-blue-100 text-blue-800': fishStore.getHealthClass(fish) === 'health-normal',
                    'bg-orange-100 text-orange-800':
                      fishStore.getHealthClass(fish) === 'health-bad',
                    'bg-red-100 text-red-800': fishStore.getHealthClass(fish) === 'health-dead',
                  },
                ]"
              >
                {{ fishStore.getHealth(fish) }}
              </span>
            </p>
            <p>
              <span class="font-semibold">Son Beslenme:</span>
              {{ fishStore.timeSinceLastFeed(fish) }}
            </p>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            class="px-4 py-2 bg-green-500 text-white rounded-full text-sm hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            @click="fishStore.feed(fish)"
            :disabled="fish.healthStatus === 0"
          >
            Besle
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useFishStore } from '../stores/fishStore'

const fishStore = useFishStore()

// Defines required props for the modal
const props = defineProps({
  fish: {
    type: Object,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])

// Emits close event to parent component
const closeModal = () => {
  emit('close')
}

// Watches fish health and closes modal if fish dies
watch(
  () => props.fish.healthStatus,
  (newHealth) => {
    if (newHealth === 0) {
      closeModal()
    }
  }
)

// Calculates modal position based on fish location
const modalPosition = computed(() => {
  const { x, y, aquariumWidth } = props.position
  const isRightSide = x > aquariumWidth / 2

  return {
    position: 'absolute',
    ...(isRightSide
      ? {
          right: `${aquariumWidth - x + 20}px`,
          top: `${y}px`,
          transform: 'translateY(-50%)',
        }
      : {
          left: `${x + 20}px`,
          top: `${y}px`,
          transform: 'translateY(-50%)',
        }),
  }
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  @apply transition-all duration-200 ease-in-out;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  @apply opacity-0 -translate-x-5 -translate-y-1/2;
}

.fixed[style*='left'] {
  @apply ml-2.5;
}

.fixed[style*='left']::before {
  content: '';
  @apply absolute top-1/2 -left-2.5 -translate-y-1/2 border-[10px] border-transparent border-r-white;
}

.fixed[style*='right'] {
  @apply mr-2.5;
}

.fixed[style*='right']::before {
  content: '';
  @apply absolute top-1/2 -right-2.5 -translate-y-1/2 border-[10px] border-transparent border-l-white;
}
</style>
