<script setup>
import { computed } from 'vue'
import { ACHIEVEMENTS } from '../constants/garden'

const props = defineProps({
  progress: {
    type: Array,
    required: true,
  },
})

const badges = computed(() => {
  const progressMap = new Map(props.progress.map((item) => [item.id, item]))
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    ...(progressMap.get(achievement.id) || { current: 0, remaining: achievement.target, earned: false }),
  }))
})

const earnedCount = computed(() => badges.value.filter((item) => item.earned).length)
</script>

<template>
  <section class="panel">
    <div class="panel-heading">
      <h2>成就徽章</h2>
      <span>{{ earnedCount }} / {{ ACHIEVEMENTS.length }}</span>
    </div>
    <div class="badge-grid">
      <article v-for="badge in badges" :key="badge.id" :class="['badge-card', { earned: badge.earned }]">
        <strong>{{ badge.name }}</strong>
        <p>{{ badge.description }}</p>
        <div class="badge-progress">
          <progress :max="badge.target" :value="badge.current"></progress>
          <span class="badge-progress-text">
            {{ badge.current }} / {{ badge.target }} {{ badge.unit }}
          </span>
        </div>
        <span class="badge-points">
          <template v-if="badge.earned">已解锁</template>
          <template v-else>还差 {{ badge.remaining }} {{ badge.unit }}</template>
          · {{ badge.points }} 分
        </span>
      </article>
    </div>
  </section>
</template>
