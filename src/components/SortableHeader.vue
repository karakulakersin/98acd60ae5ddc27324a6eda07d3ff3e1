<template>
  <th @click="$emit('sort', field)" class="sortable">
    {{ title }}
    <span class="sort-icon" :class="getSortIconClass">
      <i class="arrow up"></i>
      <i class="arrow down"></i>
    </span>
  </th>
</template>

<script setup>
import { computed } from 'vue'

// Defines required props for sortable header
const props = defineProps({
  field: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  currentSortField: {
    type: String,
    default: null,
  },
  currentSortDirection: {
    type: String,
    default: 'asc',
  },
})

// Returns appropriate CSS class for sort icon
const getSortIconClass = computed(() => {
  if (props.currentSortField !== props.field) return ''
  return props.currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc'
})
</script>

<style scoped>
.sortable {
  @apply p-3 text-white font-medium text-left text-[0.95rem] cursor-pointer relative;
}

.sort-icon {
  @apply inline-flex flex-col ml-1 relative h-[0.25rem] w-2;
}

.arrow {
  @apply absolute w-0 h-0 border-x-[5px] border-x-transparent;
}

.arrow.up {
  @apply border-b-[5px] border-b-white/50 -top-[0.5rem];
}

.arrow.down {
  @apply border-t-[5px] border-t-white/50 -bottom-1;
}

.sort-asc .arrow.up {
  @apply border-b-white;
}

.sort-desc .arrow.down {
  @apply border-t-white;
}
</style>
