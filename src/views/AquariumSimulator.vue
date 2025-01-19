<template>
  <div>
    <aquarium />
    <simulation-time-control />
    <fish-table />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import SimulationTimeControl from '../components/SimulationTimeControl.vue'
import FishTable from '../components/FishTable.vue'
import { useFishStore } from '../stores/fishStore'
import Aquarium from '../components/Aquarium.vue'

const fishStore = useFishStore()

onMounted(() => {
  fishStore.fetchFishList()
})
</script>
