<template>
  <div class="audio-study">
    <!-- Header with Deck Info -->
    <LoadableProvider :loadable="deckLoadable">
      <template #error>
        <error-page message="Failed to load deck. Please try again."></error-page>
      </template>

      <template #default="{ loading, data: deck }">
        <el-header v-loading="loading" v-if="deck" style="margin-bottom: 30px;">
          <return-link @click="returnToDeck">Return to deck</return-link>

          <section-layout>
            <template #header>
              <div style="display: flex; align-items: center;">
                <span style="font-size: 30px;">Voice Study:</span>
                <span style="font-size: 30px; margin-left: 5px; color: var(--el-color-primary); font-weight: bold;">{{ deck.title }}</span>
              </div>
            </template>
          </section-layout>
        </el-header>
      </template>
    </LoadableProvider>
    <!-- Premium gate -->
    <premium-content>
      <!-- Session End Screen -->
      <div v-if="showEndScreen" class="audio-study__center">
        <el-result icon="success" title="Session Complete">
          <template #sub-title>
            <p v-if="sessionStats" style="font-size: 18px; color: #555;">
              You reviewed <strong style="color: var(--el-color-primary);">{{ sessionStats.cards_reviewed }}</strong> {{ sessionStats.cards_reviewed === 1 ? 'card' : 'cards' }} this session.
            </p>
            <p v-else style="color: #888;">Loading session stats…</p>
          </template>
          <template #extra>
            <brand-button type="primary" @click="returnToDeck">Return to Deck</brand-button>
          </template>
        </el-result>
      </div>

      <!-- Central visualizer area -->
      <template v-if="!showEndScreen">
        <div class="audio-study__center">
          <div class="audio-study__orb-container">
            <!-- Ring layers — outermost to innermost -->
            <div class="audio-study__ring audio-study__ring--3" :style="ring3Style"></div>
            <div class="audio-study__ring audio-study__ring--2" :style="ring2Style"></div>
            <div class="audio-study__ring audio-study__ring--1" :style="ring1Style"></div>

            <!-- Canvas waveform ring (drawn on top of rings, behind the core) -->
            <canvas
              ref="waveCanvas"
              class="audio-study__wave-canvas"
              width="280"
              height="280"
            ></canvas>

            <!-- Core orb -->
            <div
              class="audio-study__core"
              :class="{
                'audio-study__core--speaking': aiSpeaking,
                'audio-study__core--idle': status === 'idle' || status === 'disconnected',
                'audio-study__core--active': status === 'active' && !aiSpeaking,
                'audio-study__core--paused': status === 'paused',
                'audio-study__core--error': status === 'error',
                'audio-study__core--clickable': status === 'idle' || status === 'disconnected' || status === 'error'
              }"
              :style="coreStyle"
              @click="onOrbClick"
            >
              <font-awesome-icon
                v-if="status === 'idle' || status === 'disconnected'"
                :icon="['fas', 'microphone']"
                class="audio-study__core-icon"
              />
              <font-awesome-icon
                v-else-if="status === 'paused'"
                :icon="['fas', 'pause']"
                class="audio-study__core-icon"
              />
              <font-awesome-icon
                v-else-if="status === 'error'"
                :icon="['fas', 'exclamation-triangle']"
                class="audio-study__core-icon"
              />
              <!-- Active / speaking — no icon, just the waveform ring around it -->
              <div v-else class="audio-study__core-pulse"></div>
            </div>
          </div>

          <!-- Status text -->
          <p class="audio-study__status">{{ statusMessage || statusLabel }}</p>

          <!-- Error message -->
          <p v-if="error" class="audio-study__error">{{ error }}</p>

          <!-- Inline session controls (only when session is active) -->
          <Transition name="fade">
            <div v-if="isSessionActive" class="audio-study__inline-controls">
              <button
                v-if="status === 'active'"
                class="audio-study__text-btn"
                @click="pause"
              >
                <font-awesome-icon :icon="['fas', 'pause']" />
                Pause
              </button>
              <button
                v-if="status === 'paused'"
                class="audio-study__text-btn audio-study__text-btn--primary"
                @click="resume"
              >
                <font-awesome-icon :icon="['fas', 'play']" />
                Resume
              </button>
              <span class="audio-study__controls-divider"></span>
              <button
                class="audio-study__text-btn audio-study__text-btn--danger"
                @click="endSession"
              >
                <font-awesome-icon :icon="['fas', 'stop']" />
                End Session
              </button>
            </div>
          </Transition>

          <div v-if='usageData' class="audio-study__usage">
            <p>Usage this month:</p>
            <div class='audio-study__usage-progress'>
              <div class='audio-study__usage-progress-bar' :style="{ height: '100%', background: 'var(--el-color-primary)', width: `${(usageData.minutes_used / usageData.total_minute_budget) * 100}%` }" />
            </div>
            <p><b>{{ usageData.minutes_used }} / {{ usageData.total_minute_budget }}</b> mins (next refresh <b>{{ new Date(usageData.next_refresh_date).toLocaleDateString() }}</b>)</p>
          </div>
        </div>

        <!-- Card review notification toasts -->
        <div class="audio-study__toasts">
          <TransitionGroup name="toast">
            <div
              v-for="evt in cardEvents"
              :key="evt.id"
              class="audio-study__toast"
              :class="`audio-study__toast--${evt.difficulty}`"
            >
              <div class="audio-study__toast-badge">
                {{ difficultyLabel(evt.difficulty) }}
              </div>
              <div class="audio-study__toast-content">
                {{ cardPreviewText(evt) }}
              </div>
            </div>
          </TransitionGroup>
        </div>
      </template>

      <!-- Non-subscriber slot -->
      <template #nonSubscriber>
        <div class="audio-study__center">
          <el-result icon="warning" title="Premium Feature">
            <template #sub-title>
              <p style="font-size: 16px; color: #555;">Voice Study is available to Pro subscribers.</p>
            </template>
            <template #extra>
              <brand-button type="primary" @click="upgrade"><premium-marker /> Upgrade to Pro</brand-button>
            </template>
          </el-result>
        </div>
      </template>
    </premium-content>

    <!-- First-time info dialog -->
    <SoftDialog :modal="introModal" title="Welcome to Voice Study" size="default">
      <div class="audio-study__intro">
        <p>Here’s how it works:</p>
        <ul>
          <li><strong>Just start talking</strong> — tap the microphone and the AI will pull your reviews to go over conversationally.</li>
          <li><strong>Reviews count</strong> — as you go, it will submit card reviews based on how well you knew them. These count toward your daily review totals!</li>
          <li><strong>Review cards only</strong> — right now, Voice Study excludes cards that are New or in the Learning phase.</li>
          <li><strong>Request topics</strong> — at any time, tell the AI what topics in your deck you’d like to review and it will naturally pull those cards up.</li>
          <li><strong>Beta disclaimer</strong> — this is a beta feature and can make mistakes. There is a chance it may inaccurately mark cards as reviewed, which could risk missing certain items.</li>
        </ul>
        <div style="text-align: right; margin-top: 16px;">
          <brand-button type="primary" @click="introModal.close()">Got it!</brand-button>
        </div>
      </div>
    </SoftDialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useAudioSession from '../composables/api/useAudioSession'
import useDeck from '../composables/api/useDeck'
import useSupabase from '../composables/api/UseSupabase'
import usePremiumFeature from '../composables/api/usePremiumFeature'
import useLoadable from '../composables/ui/useLoadable'
import useModal from '../composables/ui/useModal'
import ReturnLink from '../components/basic/ReturnLink.vue'
import SectionLayout from '../components/basic/SectionLayout.vue'
import BrandButton from '../components/basic/BrandButton.vue'
import LoadableProvider from '../components/basic/providers/LoadableProvider.vue'
import ErrorPage from '../components/basic/errorHandling/ErrorPage.vue'
import PremiumContent from '../components/PremiumContent.vue'
import PremiumMarker from '../components/basic/PremiumMarker.vue'
import SoftDialog from '../components/basic/soft-ui/SoftDialog.vue'
import { setThemeColor } from '../utils'

const route = useRoute()
const router = useRouter()
const waveCanvas = ref(null)
let animationId = null
let wavePhase = 0

const { fetchData } = useDeck(route.params.deckId)
const { supabase } = useSupabase()
const premiumFeature = usePremiumFeature()

const deckLoadable = useLoadable(async () => {
  const deck = await fetchData()
  setThemeColor(deck.primaryColor, document.documentElement)
  return deck
})

// End screen state
const showEndScreen = ref(false)
const sessionStats = ref(null)

// First-time intro dialog
const introModal = useModal({})
const INTRO_SEEN_KEY = 'voice_study_intro_seen'

const {
  status,
  aiSpeaking,
  aiAmplitude,
  sessionId,
  statusMessage,
  cardEvents,
  error,
  usageData,
  connect,
  disconnect,
  pause,
  resume
} = useAudioSession()

// ── Computed ────────────────────────────────────────────────────
const statusLabel = computed(() => {
  switch (status.value) {
    case 'idle': return 'Tap to start your voice study session'
    case 'connecting': return 'Connecting…'
    case 'active': return 'Listening…'
    case 'paused': return 'Session paused'
    case 'error': return 'Something went wrong'
    case 'disconnected': return 'Session ended'
    default: return ''
  }
})

// Smoothed amplitude for ring layers
const smoothAmp = ref(0)
watch(aiAmplitude, (newVal) => {
  smoothAmp.value += (newVal - smoothAmp.value) * 0.5
})

const isSessionActive = computed(() =>
  status.value === 'active' || status.value === 'paused' || status.value === 'connecting'
)

// Core orb style — subtle scale on amplitude
const coreStyle = computed(() => {
  const amp = smoothAmp.value
  const scale = 1 + amp * 0.08
  return { transform: `scale(${scale})` }
})

// Ring layers scale and opacity
const ring1Style = computed(() => {
  const amp = smoothAmp.value
  const base = isSessionActive.value ? 1 : 0
  return {
    opacity: base * (0.18 + amp * 0.35),
    transform: `scale(${1 + amp * 0.12})`
  }
})

const ring2Style = computed(() => {
  const amp = smoothAmp.value
  const base = isSessionActive.value ? 1 : 0
  return {
    opacity: base * (0.10 + amp * 0.22),
    transform: `scale(${1 + amp * 0.18})`
  }
})

const ring3Style = computed(() => {
  const amp = smoothAmp.value
  const base = isSessionActive.value ? 1 : 0
  return {
    opacity: base * (0.06 + amp * 0.14),
    transform: `scale(${1 + amp * 0.25})`
  }
})

// ── Waveform canvas animation ───────────────────────────────────
const drawWaveform = () => {
  const canvas = waveCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const cx = w / 2
  const cy = h / 2
  const baseRadius = 68
  const amp = smoothAmp.value

  ctx.clearRect(0, 0, w, h)

  if (!isSessionActive.value) {
    animationId = requestAnimationFrame(drawWaveform)
    return
  }

  // Retrieve the element's computed primary colour for canvas drawing
  const el = canvas.closest('.audio-study__orb-container')
  const primary = getComputedStyle(el).getPropertyValue('--el-color-primary').trim() || '#409EFF'

  const numPoints = 128
  const step = (Math.PI * 2) / numPoints

  wavePhase += 0.04

  // Draw two offset wave rings for depth
  for (let layer = 0; layer < 2; layer++) {
    const layerAmpMul = layer === 0 ? 1.0 : 0.6
    const layerOffset = layer === 0 ? 0 : Math.PI * 0.7
    const layerAlpha = layer === 0 ? (0.5 + amp * 0.5) : (0.25 + amp * 0.25)

    ctx.beginPath()
    for (let i = 0; i <= numPoints; i++) {
      const angle = i * step
      // Combine multiple sine waves for an organic ring distortion
      const wave =
        Math.sin(angle * 3 + wavePhase + layerOffset) * 0.4 +
        Math.sin(angle * 5 - wavePhase * 1.3 + layerOffset) * 0.3 +
        Math.sin(angle * 7 + wavePhase * 0.7 + layerOffset) * 0.15 +
        Math.sin(angle * 2 - wavePhase * 0.5 + layerOffset) * 0.15

      const distortion = amp * 14 * layerAmpMul * wave
      const r = baseRadius + distortion

      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }

    ctx.closePath()
    ctx.strokeStyle = primary
    ctx.globalAlpha = layerAlpha
    ctx.lineWidth = layer === 0 ? 2.5 : 1.5
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  animationId = requestAnimationFrame(drawWaveform)
}

onMounted(() => {
  animationId = requestAnimationFrame(drawWaveform)
  deckLoadable.load()

  // Show intro dialog on first visit
  if (!localStorage.getItem(INTRO_SEEN_KEY)) {
    introModal.open()
    localStorage.setItem(INTRO_SEEN_KEY, 'true')
  }
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})

// ── Actions ─────────────────────────────────────────────────────
const onOrbClick = () => {
  if (status.value === 'idle' || status.value === 'disconnected' || status.value === 'error') {
    connect(route.params.deckId, null)
  }
}

const startSession = () => {
  connect(route.params.deckId, null)
}

const upgrade = () => {
  premiumFeature.execute(() => {}, () => {})
}

const endSession = async () => {
  const sid = sessionId.value
  disconnect()
  if (sid) {
    showEndScreen.value = true
    // Fetch session stats from Supabase
    const { data, error: fetchError } = await supabase
      .from('voice_sessions')
      .select('cards_reviewed')
      .eq('id', sid)
      .single()
    if (data) {
      sessionStats.value = data
    } else {
      console.error('[AudioStudy] Failed to fetch session stats:', fetchError)
      sessionStats.value = { cards_reviewed: 0 }
    }
  }
}

const returnToDeck = () => {
  disconnect()
  router.push(`/deck/${route.params.deckId}`)
}

// ── Helpers ─────────────────────────────────────────────────────
const difficultyLabel = (difficulty) => {
  switch (difficulty) {
    case 'correct': return 'Good'
    case 'struggled': return 'Hard'
    case 'incorrect': return 'Again'
    case 'skipped': return 'Skipped'
    default: return difficulty
  }
}

const cardPreviewText = (evt) => {
  if (!evt.card?.content) return `Card #${evt.cardId}`
  const content = evt.card.content
  const frontText = content.split('\\n\\n')[0] || content.split('\n\n')[0] || content
  return frontText.length > 80 ? frontText.slice(0, 77) + '…' : frontText
}
</script>

<style scoped>
.audio-study {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  position: relative;
  overflow: hidden;
}


/* ── Center visualizer ──────────────────────────────────────────── */
.audio-study__center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  min-height: 0;
}

.audio-study__orb-container {
  position: relative;
  width: 280px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Concentric ring layers ─────────────────────────────────────── */
.audio-study__ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid var(--el-color-primary);
  opacity: 0;
  transition: opacity 0.4s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.audio-study__ring--1 {
  width: 170px;
  height: 170px;
}

.audio-study__ring--2 {
  width: 210px;
  height: 210px;
}

.audio-study__ring--3 {
  width: 250px;
  height: 250px;
}

/* ── Canvas waveform ────────────────────────────────────────────── */
.audio-study__wave-canvas {
  position: absolute;
  width: 280px;
  height: 280px;
  pointer-events: none;
  z-index: 1;
}

/* ── Core orb ───────────────────────────────────────────────────── */
.audio-study__core {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.3s ease,
              background 0.3s ease;
  box-shadow: 0 2px 20px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
}

.audio-study__core--idle {
  animation: breath 3.5s ease-in-out infinite;
}

.audio-study__core--active {
  background: var(--el-color-primary-light-7);
  box-shadow: 0 0 30px color-mix(in srgb, var(--el-color-primary) 20%, transparent);
}

.audio-study__core--speaking {
  background: var(--el-color-primary-light-6);
  box-shadow:
    0 0 30px color-mix(in srgb, var(--el-color-primary) 25%, transparent),
    0 0 60px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
}

.audio-study__core--paused {
  opacity: 0.65;
}

.audio-study__core--error {
  background: var(--el-color-error-light-8);
  box-shadow: 0 0 20px color-mix(in srgb, var(--el-color-error) 15%, transparent);
}

/* Breathing keyframes for idle state */
@keyframes breath {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.06); }
}

.audio-study__core-icon {
  font-size: 36px;
  color: var(--el-color-primary);
}

.audio-study__core--error .audio-study__core-icon {
  color: var(--el-color-error);
}

/* Subtle inner dot when active / speaking */
.audio-study__core-pulse {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--el-color-primary);
  opacity: 0.5;
  animation: innerPulse 1.8s ease-in-out infinite;
}

@keyframes innerPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50%      { transform: scale(1.4); opacity: 0.25; }
}

/* ── Status text ────────────────────────────────────────────────── */
.audio-study__status {
  font-size: 15px;
  color: #777;
  text-align: center;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.audio-study__error {
  font-size: 13px;
  color: var(--el-color-error);
  text-align: center;
  margin: 0;
}

/* ── Toast notifications ────────────────────────────────────────── */
.audio-study__toasts {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 360px;
  max-width: 90vw;
  z-index: 10;
  pointer-events: none;
}

.audio-study__toast {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  padding: 10px 14px;
  pointer-events: auto;
}

.audio-study__toast--correct {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}
.audio-study__toast--struggled {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}
.audio-study__toast--incorrect {
  background: var(--el-color-error-light-9);
  color: var(--el-color-error);
}
.audio-study__toast--skipped {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.audio-study__toast-badge {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.audio-study__toast-content {
  font-size: 13px;
  color: inherit;
  opacity: 0.8;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Toast transition — fade in from bottom */
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ── Inline session controls ────────────────────────────────────── */
.audio-study__inline-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.audio-study__usage {
  color: #888;
  font-size: 13px;
  text-align: center;
  min-width: 350px;
  border: solid #EEE 2px;
  border-radius: 10px;
  padding: 10px;
}

.audio-study__usage-progress {
  width: 100%;
  height: 7px;
  background-color: #EEE;
  border-radius: 7px;
  overflow: hidden;
  margin: 10px 0px;
}

.audio-study__usage-progress-bar {
  height: 100%;
  background-color: var(--el-color-primary);
  border-radius: 7px;
  overflow: hidden;
  transition: width 0.3s ease;
}

.audio-study__text-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: #888;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s ease, background 0.15s ease;
}

.audio-study__text-btn:hover {
  color: #555;
  background: #f0f0f0;
}

.audio-study__text-btn--primary {
  color: var(--el-color-primary);
}
.audio-study__text-btn--primary:hover {
  color: var(--el-color-primary-dark-2);
  background: var(--el-color-primary-light-9);
}

.audio-study__text-btn--danger {
  color: var(--el-color-error);
}
.audio-study__text-btn--danger:hover {
  color: var(--el-color-error-dark-2);
  background: var(--el-color-error-light-9);
}

.audio-study__controls-divider {
  width: 1px;
  height: 18px;
  background: #ddd;
}

/* Fade transition for inline controls */
.fade-enter-active { transition: opacity 0.25s ease; }
.fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.audio-study__core--clickable {
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.3s ease,
              background 0.2s ease;
}
.audio-study__core--clickable:hover {
  background: var(--el-color-primary-light-7);
}

/* ── Intro dialog ──────────────────────────────────────────────── */
.audio-study__intro {
  font-size: 14px;
  line-height: 1.6;
  color: #444;
}

.audio-study__intro ul {
  padding-left: 20px;
  margin: 12px 0 0;
}

.audio-study__intro li {
  margin-bottom: 10px;
}

.audio-study__intro li strong {
  color: #222;
}
</style>
