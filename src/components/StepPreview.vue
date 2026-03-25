<template>
  <section class="panel">
    <div class="panel__header">
      <div>
        <div class="eyebrow">推算結果</div>
        <h2 class="panel__title">台階配置</h2>
      </div>

      <div class="status-badge" :class="statusClass">{{ statusText }}</div>
    </div>

    <div class="stairs">
      <div v-for="(count, index) in solution" :key="index" class="stairs__step">
        <div class="stairs__number">{{ index + 1 }}</div>
        <div class="stairs__people">
          <span v-for="person in count" :key="person" class="stairs__person" aria-hidden="true">✦</span>
          <span v-if="count === 0" class="stairs__empty">0 人</span>
        </div>
        <div class="stairs__count">{{ count }} 人</div>
      </div>
    </div>

    <div class="solution-code">
      <span class="solution-code__label">答案</span>
      <span class="solution-code__value">{{ solution.join('') }}</span>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  solution: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    default: 'unique',
  },
})

const statusText = computed(() => {
  if (props.status === 'unique') return '已鎖定'
  if (props.status === 'shared') return '目前共同結果'
  return '等待輸入'
})

const statusClass = computed(() => {
  return props.status === 'unique' ? 'status-badge--success' : 'status-badge--info'
})
</script>
