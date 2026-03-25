<template>
  <main class="app-shell">
    <div class="app-shell__spark app-shell__spark--one"></div>
    <div class="app-shell__spark app-shell__spark--two"></div>
    <div class="app-shell__spark app-shell__spark--three"></div>

    <div class="app">
      <header class="hero">
        <div>
          <div class="hero__subtitle">AbySoul 公會副本小幫手 ✨</div>
          <h1 class="hero__title">楓之谷 - 女神之塔封印之間解題工具</h1>
        </div>

        <div class="hero__actions">
          <button
            v-if="pipSupported && !isPipOpen"
            class="hero-button hero-button--accent"
            type="button"
            @click="openPip"
          >
            PiP 模式
          </button>

          <button
            v-if="isPipOpen"
            class="hero-button hero-button--accent"
            type="button"
            @click="closePip"
          >
            關閉 PiP
          </button>

          <button class="hero-button hero-button--ghost" type="button" @click="resetInputs">
            清空
          </button>
        </div>
      </header>

      <section class="panel panel--compact hero-panel">
        <p class="plain-text">
          依序填入 A / B / C / D 的數字，工具會即時推算三個台階（1 / 2 / 3）各需要站幾個人。
        </p>
      </section>

      <section class="response-grid">
        <ResponseCard
          v-for="item in responseCards"
          :key="item.key"
          v-model="inputs[item.key]"
          :label="item.label"
          :title="item.title"
          :hint="item.hint"
          :pattern="item.pattern"
        />
      </section>

      <section class="summary-grid">
        <section class="panel panel--compact glass-panel">
          <div class="panel__header panel__header--tight">
            <div>
              <div class="eyebrow">目前進度</div>
              <h2 class="panel__title">候選解</h2>
            </div>

            <div class="summary-chip">
              {{ filteredSolutions.length }} / {{ allSolutions.length }}
            </div>
          </div>

          <div v-if="filteredSolutions.length === 0" class="empty-state">
            這組輸入沒有對應答案，檢查一下數字有沒有填錯。
          </div>

          <div v-else class="candidate-list">
            <button
              v-for="solution in filteredSolutions"
              :key="solution.join('')"
              type="button"
              class="candidate-pill"
              :class="{ 'candidate-pill--active': activeSolution?.join('') === solution.join('') }"
              @click="activeSolution = solution"
            >
              {{ solution.join('') }}
            </button>
          </div>
        </section>

        <StepPreview
          v-if="displaySolution"
          :solution="displaySolution"
          :status="previewStatus"
        />

        <section v-else class="panel panel--compact glass-panel">
          <div class="panel__header panel__header--tight">
            <div>
              <div class="eyebrow">推算結果</div>
              <h2 class="panel__title">台階配置</h2>
            </div>
          </div>

          <div class="empty-state">
            先輸入至少一組 NPC 回覆，這裡就會開始幫你推算。
          </div>
        </section>
      </section>

      <footer class="site-footer">
        © 2026 Sakuta • Crafted with ☕ & chaos • AbySoul
      </footer>
    </div>
  </main>
</template>

<script setup>
import { computed, reactive, ref, watch, onBeforeUnmount, createApp as createVueApp, h } from 'vue'
import ResponseCard from './components/ResponseCard.vue'
import StepPreview from './components/StepPreview.vue'
import PipPanel from './components/PipPanel.vue'
import { generateAllSolutions, filterSolutions } from './solver'

const responseCards = [
  { key: 'a', label: 'A', title: '全員不站', hint: '先看有幾個台階的人數剛好是 0。', pattern: '000' },
  { key: 'b', label: 'B', title: '隊長站 1', hint: '只有 1 號台階多 1 人。', pattern: '100' },
  { key: 'c', label: 'C', title: '隊長站 2', hint: '只有 2 號台階多 1 人。', pattern: '010' },
  { key: 'd', label: 'D', title: '隊長站 3', hint: '只有 3 號台階多 1 人。', pattern: '001' },
]

const inputs = reactive({
  a: '',
  b: '',
  c: '',
  d: '',
})

const allSolutions = generateAllSolutions()
const filteredSolutions = computed(() => filterSolutions(allSolutions, inputs))
const activeSolution = ref(filteredSolutions.value[0] ?? null)

watch(
  filteredSolutions,
  (list) => {
    if (!list.length) {
      activeSolution.value = null
      return
    }

    const currentCode = activeSolution.value?.join('')
    const stillExists = list.some((item) => item.join('') === currentCode)
    if (!stillExists) activeSolution.value = list[0]
  },
  { immediate: true },
)

const consensusSolution = computed(() => {
  if (!filteredSolutions.value.length) return null
  const columns = [0, 1, 2].map((index) => new Set(filteredSolutions.value.map((item) => item[index])))
  if (!columns.every((set) => set.size === 1)) return null
  return columns.map((set) => [...set][0])
})

const displaySolution = computed(() => {
  if (!filteredSolutions.value.length) return null
  if (filteredSolutions.value.length === 1) return filteredSolutions.value[0]
  if (consensusSolution.value) return consensusSolution.value
  return activeSolution.value
})

const previewStatus = computed(() => {
  if (filteredSolutions.value.length === 1) return 'unique'
  return 'shared'
})

function resetInputs() {
  inputs.a = ''
  inputs.b = ''
  inputs.c = ''
  inputs.d = ''
}

const pipSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window
const isPipOpen = ref(false)

let pipWindow = null
let pipVueApp = null

function createPipRootComponent() {
  return {
    setup() {
      return () =>
        h(PipPanel, {
          modelValue: inputs,
          solutions: filteredSolutions.value,
          responseCards,
          'onUpdate:modelValue': (nextValue) => {
            inputs.a = nextValue.a
            inputs.b = nextValue.b
            inputs.c = nextValue.c
            inputs.d = nextValue.d
          },
          onClear: resetInputs,
        })
    },
  }
}

async function openPip() {
  if (!pipSupported || isPipOpen.value) return

  try {
    pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 360,
      height: 300,
    })

    const styleLink = pipWindow.document.createElement('link')
    styleLink.rel = 'stylesheet'
    styleLink.href = new URL('./styles.css', import.meta.url).href
    pipWindow.document.head.appendChild(styleLink)

    pipWindow.document.title = '封印之間 PiP'
    pipWindow.document.body.className = 'pip-body'

    const mountPoint = pipWindow.document.createElement('div')
    mountPoint.id = 'pip-app'
    pipWindow.document.body.appendChild(mountPoint)

    pipVueApp = createVueApp(createPipRootComponent())
    pipVueApp.mount(mountPoint)

    isPipOpen.value = true

    pipWindow.addEventListener('pagehide', () => {
      destroyPip(true)
    })
  } catch (error) {
    console.error('PiP 開啟失敗', error)
  }
}

function destroyPip(fromWindow = false) {
  if (pipVueApp) {
    pipVueApp.unmount()
    pipVueApp = null
  }

  if (pipWindow && !fromWindow) {
    pipWindow.close()
  }

  pipWindow = null
  isPipOpen.value = false
}

function closePip() {
  destroyPip(false)
}

onBeforeUnmount(() => {
  destroyPip(false)
})
</script>
