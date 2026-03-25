<template>
  <section class="response-card">
    <div class="response-card__top">
      <div class="response-card__meta">
        <div class="response-card__label">{{ label }}</div>
        <div class="response-card__title">{{ title }}</div>
        <div class="response-card__hint">{{ hint }}</div>
      </div>

      <div class="response-card__badge">{{ pattern }}</div>
    </div>

    <div class="stepper">
      <button class="stepper__btn" type="button" aria-label="減少" @click="decrease">−</button>
      <input
        :value="modelValue"
        class="stepper__input"
        type="number"
        inputmode="numeric"
        min="0"
        max="2"
        placeholder="-"
        @input="onInput"
      />
      <button class="stepper__btn" type="button" aria-label="增加" @click="increase">+</button>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  label: String,
  title: String,
  hint: String,
  pattern: String,
  modelValue: {
    type: [String, Number],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

function normalize(value) {
  if (value === '' || value === null || value === undefined) return ''
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return ''
  return String(Math.min(2, Math.max(0, numeric)))
}

function onInput(event) {
  emit('update:modelValue', normalize(event.target.value))
}

function increase() {
  const current = props.modelValue === '' ? 0 : Number(props.modelValue)
  emit('update:modelValue', String(Math.min(2, current + 1)))
}

function decrease() {
  const current = props.modelValue === '' ? 0 : Number(props.modelValue)
  emit('update:modelValue', String(Math.max(0, current - 1)))
}
</script>
