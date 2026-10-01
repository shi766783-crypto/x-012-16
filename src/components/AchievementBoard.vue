<script setup>
const props = defineProps({
  badges: {
    type: Array,
    required: true,
  },
})

function progressPercent(badge) {
  if (!badge.target) return 0
  return Math.min(100, Math.round((badge.current / badge.target) * 100))
}
</script>

<template>
  <section class="panel">
    <div class="panel-heading">
      <h2>成就徽章</h2>
      <span>{{ badges.filter((badge) => badge.earned).length }} / {{ badges.length }}</span>
    </div>
    <div class="badge-grid">
      <article
        v-for="badge in badges"
        :key="badge.id"
        :class="['badge-card', { earned: badge.earned }]"
      >
        <div class="badge-card-heading">
          <strong>{{ badge.name }}</strong>
          <span v-if="badge.earned" class="badge-status">已解锁</span>
        </div>
        <p>{{ badge.description }}</p>
        <div class="badge-progress">
          <progress :max="badge.target" :value="Math.min(badge.current, badge.target)"></progress>
          <span class="badge-progress-text">
            <template v-if="badge.earned">
              {{ badge.target }} / {{ badge.target }} {{ badge.unit }}
            </template>
            <template v-else>
              {{ badge.current }} / {{ badge.target }} {{ badge.unit }}
            </template>
          </span>
        </div>
        <span class="badge-percent">{{ badge.earned ? 100 : progressPercent(badge) }}%</span>
        <span class="badge-points">{{ badge.points }} 分</span>
      </article>
    </div>
  </section>
</template>
