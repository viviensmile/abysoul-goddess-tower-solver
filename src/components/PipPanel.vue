<template>
  <section class="pip-panel">
    <div class="pip-panel__header">
      <div>
        <div class="pip-panel__eyebrow">女神之塔封印之間</div>
        <div class="pip-panel__title">PiP 快速輸入</div>
      </div>

      <button class="pip-clear" type="button" @click="$emit('clear')">清空</button>
    </div>

    <div class="pip-inline-list">
      <div v-for="item in responseCards" :key="item.key" class="pip-inline-item">
        <div class="pip-inline-item__head">
          <span class="pip-inline-item__label">{{ item.label }}</span>
          <span class="pip-inline-item__badge">{{ item.pattern }}</span>
        </div>

        <div class="pip-inline-stepper">
          <button type="button" class="pip-inline-stepper__btn" @click="change(item.key, -1)">−</button>
          <input
            :value="modelValue[item.key]"
            type="number"
            min="0"
            max="2"
            inputmode="numeric"
            class="pip-inline-stepper__input"
            placeholder="-"
            @input="onInput(item.key, $event)"
          />
          <button type="button" class="pip-inline-stepper__btn" @click="change(item.key, 1)">+</button>
        </div>
      </div>
    </div>

    <div class="pip-result">
      <div class="pip-result__label">候選解</div>
      <div v-if="solutions.length" class="pip-result__values">
        <span v-for="solution in solutions" :key="solution.join('')" class="pip-result__pill">
          {{ solution.join('') }}
        </span>
      </div>
      <div v-else class="pip-result__empty">無對應答案</div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  solutions: {
    type: Array,
    required: true,
  },
  responseCards: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'clear'])

function normalize(value) {
  if (value === '' || value === null || value === undefined) return ''
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return ''
  return String(Math.min(2, Math.max(0, numeric)))
}

function patchValue(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}

function change(key, delta) {
  const current = props.modelValue[key] === '' ? 0 : Number(props.modelValue[key])
  patchValue(key, String(Math.min(2, Math.max(0, current + delta))))
}

function onInput(key, event) {
  patchValue(key, normalize(event.target.value))
}
</script>
