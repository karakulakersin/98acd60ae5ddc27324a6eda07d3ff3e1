<template>
  <div class="p-5 bg-white/95 rounded-xl shadow-md mx-auto my-5 max-w-[900px]">
    <div class="w-full overflow-x-auto">
      <table class="w-full min-w-[800px] border-collapse font-sans">
        <thead>
          <tr>
            <th
              class="bg-blue-500 text-white p-3 font-medium text-left text-[0.95rem] first:rounded-tl-lg"
            >
              Görsel
            </th>
            <sortable-header
              field="name"
              title="Adı"
              :currentSortField="sortField"
              :currentSortDirection="sortDirection"
              @sort="sort"
              class="bg-blue-500 text-white font-medium"
            />
            <sortable-header
              field="type"
              title="Türü"
              :currentSortField="sortField"
              :currentSortDirection="sortDirection"
              @sort="sort"
              class="bg-blue-500 text-white font-medium"
            />
            <sortable-header
              field="weight"
              title="Ağırlık"
              :currentSortField="sortField"
              :currentSortDirection="sortDirection"
              @sort="sort"
              class="bg-blue-500 text-white font-medium"
            />
            <sortable-header
              field="lastFeedDiff"
              title="Beslenme"
              :currentSortField="sortField"
              :currentSortDirection="sortDirection"
              @sort="sort"
              class="bg-blue-500 text-white font-medium"
            />
            <sortable-header
              field="healthStatus"
              title="Sağlık"
              :currentSortField="sortField"
              :currentSortDirection="sortDirection"
              @sort="sort"
              class="bg-blue-500 text-white font-medium"
            />
            <th
              class="bg-blue-500 text-white p-3 font-medium text-left text-[0.95rem] last:rounded-tr-lg"
            >
              İşlem
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="fish in sortedFishList"
            :key="fish.id"
            :class="[
              'hover:bg-gray-50 border-b border-gray-200',
              { 'bg-gray-100 text-gray-400': fish.healthStatus === 0 },
            ]"
          >
            <td class="p-3 text-center w-20">
              <div
                class="w-[50px] h-[50px] flex items-center justify-center bg-blue-500/10 rounded-lg p-2 transition-all duration-300 hover:scale-110 hover:bg-blue-500/20 hover:shadow-md mx-auto"
              >
                <img
                  :src="fish.imageUrl"
                  :alt="fish.type"
                  class="max-w-full max-h-full object-contain transition-all duration-300"
                  :class="{
                    'grayscale brightness-75': fish.healthStatus === 0,
                  }"
                />
              </div>
            </td>
            <td class="p-3 text-gray-700">{{ fish.name }}</td>
            <td class="p-3 text-gray-700">{{ fish.type }}</td>
            <td class="p-3 text-gray-700">{{ fish.weight.toFixed(2) }} g</td>
            <td class="p-3 text-sm">
              {{ fishStore.timeSinceLastFeed(fish) }}
            </td>
            <td class="p-3">
              <div
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium inline-block text-center',
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
              </div>
            </td>
            <td class="p-3">
              <button
                v-if="fish.healthStatus !== 0"
                class="feed-button px-3 py-1.5 bg-green-500 text-white rounded-full text-sm hover:bg-green-600 transition-colors"
                @click="fishStore.feed(fish)"
              >
                Besle
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFishStore } from '../stores/fishStore'
import SortableHeader from './SortableHeader.vue'

const fishStore = useFishStore()
const sortField = ref(null)
const sortDirection = ref('asc')

// Handles sorting when column header is clicked
const sort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

// Returns sorted fish list based on current sort field and direction
const sortedFishList = computed(() => {
  const fishes = [...fishStore.fishList]
  if (!sortField.value) return fishes

  return fishes.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]

    // Handle special sorting for lastFeedDiff
    if (sortField.value === 'lastFeedDiff') {
      aVal = fishStore.getLastFeedDiffInMinutes(a)
      bVal = fishStore.getLastFeedDiffInMinutes(b)
    } else if (sortField.value === 'weight') {
      aVal = parseFloat(aVal)
      bVal = parseFloat(bVal)
    }

    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
})
</script>
