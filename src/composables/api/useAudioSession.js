import { ref, shallowRef, readonly, onUnmounted } from 'vue'
import useSupabase from './UseSupabase'

const LIVE_AUDIO_URL = import.meta.env.VITE_LIVE_AUDIO_URL || 'ws://localhost:8000'

export default function useAudioSession() {
  // ── Reactive state ──────────────────────────────────────────────
  const status = ref('idle')          // idle | connecting | active | paused | error | disconnected
  const aiSpeaking = ref(false)
  const aiAmplitude = ref(0)          // 0–1 float for the visualizer
  const sessionId = ref(null)
  const statusMessage = ref('')
  const cardEvents = ref([])          // { id, type, card, difficulty, timestamp }
  const usageData = ref(null)
  const error = ref(null)

  // ── Internals (not exposed) ─────────────────────────────────────
  let ws = null
  let audioContext = null
  let micStream = null
  let micSource = null
  let scriptProcessor = null
  let playbackContext = null
  let playbackAnalyser = null
  let analyserData = null
  let nextPlaybackTime = 0
  let cardEventIdCounter = 0
  let amplitudeRaf = null

  // Config from session_config
  let inputSampleRate = 16000
  let outputSampleRate = 24000

  // ── Live amplitude monitoring via AnalyserNode ─────────────────
  const startAnalyserLoop = () => {
    if (amplitudeRaf) return // already running

    const tick = () => {
      if (!playbackAnalyser || !analyserData) {
        amplitudeRaf = null
        return
      }

      // Read live time-domain waveform from the analyser
      playbackAnalyser.getByteTimeDomainData(analyserData)

      // Compute RMS from the 0-255 unsigned byte data (128 = silence)
      let sumSq = 0
      for (let i = 0; i < analyserData.length; i++) {
        const normalized = (analyserData[i] - 128) / 128
        sumSq += normalized * normalized
      }
      const rms = Math.sqrt(sumSq / analyserData.length)
      const target = Math.min(1, rms * 3.5)

      // Smooth: fast attack, slower release
      if (target > aiAmplitude.value) {
        aiAmplitude.value = aiAmplitude.value * 0.2 + target * 0.8
      } else {
        aiAmplitude.value = aiAmplitude.value * 0.85 + target * 0.15
      }

      // If amplitude has fully decayed and we're past turn_complete, clear speaking
      if (aiAmplitude.value < 0.005 && !aiSpeaking.value) {
        aiAmplitude.value = 0
      }

      amplitudeRaf = requestAnimationFrame(tick)
    }

    amplitudeRaf = requestAnimationFrame(tick)
  }

  const stopAnalyserLoop = () => {
    if (amplitudeRaf) {
      cancelAnimationFrame(amplitudeRaf)
      amplitudeRaf = null
    }
  }

  // ── Connection ──────────────────────────────────────────────────
  const connect = async (deckId, existingSessionId) => {
    if (ws) disconnect()

    status.value = 'connecting'
    statusMessage.value = 'Connecting…'
    error.value = null

    // Build WebSocket URL with auth token
    const { supabase } = useSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      status.value = 'error'
      error.value = 'Not authenticated'
      statusMessage.value = 'Authentication error'
      return
    }

    const params = new URLSearchParams({ token: session.access_token })
    if (existingSessionId) {
      params.set('session_id', existingSessionId)
    } else if (deckId) {
      params.set('deck_id', deckId)
    }

    const url = `${LIVE_AUDIO_URL}/ws?${params.toString()}`

    try {
      ws = new WebSocket(url)
      ws.binaryType = 'arraybuffer'

      ws.onopen = () => {
        statusMessage.value = 'Connected, waiting for config…'
      }

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          handleAudioData(event.data)
        } else {
          handleJsonMessage(JSON.parse(event.data))
        }
      }

      ws.onerror = () => {
        status.value = 'error'
        error.value = 'WebSocket connection error'
        statusMessage.value = 'Connection error'
      }

      ws.onclose = (event) => {
        if (status.value !== 'error') {
          status.value = 'disconnected'
          statusMessage.value = 'Disconnected'
        }
        cleanup()
      }
    } catch (e) {
      status.value = 'error'
      error.value = e.message
      statusMessage.value = 'Failed to connect'
    }
  }

  // ── Disconnect ──────────────────────────────────────────────────
  const disconnect = () => {
    if (ws && ws.readyState <= WebSocket.OPEN) {
      // Send pause_and_disconnect so session can be resumed later
      sendJson({ type: 'pause_and_disconnect' })
      ws.close()
    }
    cleanup()
    status.value = 'idle'
    statusMessage.value = ''
    aiSpeaking.value = false
    aiAmplitude.value = 0
  }

  // ── Control messages ────────────────────────────────────────────
  const pause = () => {
    sendJson({ type: 'pause' })
  }

  const resume = () => {
    sendJson({ type: 'resume' })
  }

  const sendJson = (obj) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj))
    }
  }

  // ── JSON event handling ─────────────────────────────────────────
  const handleJsonMessage = (msg) => {
    switch (msg.type) {
      case 'session_config':
        sessionId.value = msg.session_id
        inputSampleRate = msg.input_sample_rate || 16000
        outputSampleRate = msg.output_sample_rate || 24000
        status.value = 'active'
        statusMessage.value = 'Listening…'
        startMicrophone()
        initPlaybackContext()
        break

      case 'turn_complete':
        // Mark speaking as done — the AnalyserNode loop will keep
        // showing live amplitude from any remaining queued audio
        aiSpeaking.value = false
        statusMessage.value = 'Listening…'
        break

      case 'interrupted':
        aiSpeaking.value = false
        aiAmplitude.value = 0
        flushPlayback()
        statusMessage.value = 'Listening…'
        break

      case 'paused':
        status.value = 'paused'
        statusMessage.value = 'Paused'
        if (msg.session_id) sessionId.value = msg.session_id
        break

      case 'resumed':
        status.value = 'active'
        statusMessage.value = 'Listening…'
        break

      case 'gemini_disconnected':
        statusMessage.value = msg.message || 'AI disconnected. Waiting…'
        break

      case 'gemini_reconnected':
        statusMessage.value = msg.message || 'AI reconnected.'
        // Revert to normal after a moment
        setTimeout(() => {
          if (status.value === 'active') statusMessage.value = 'Listening…'
        }, 2000)
        break

      case 'go_away':
        statusMessage.value = `Session ending in ${msg.time_left}…`
        break

      case 'error':
        status.value = 'error'
        error.value = msg.message
        statusMessage.value = msg.message || 'An error occurred'
        break

      case 'tool_call':
        // Could add loading indicators here in the future
        break

      case 'tool_result':
        handleToolResult(msg)
        break

      case 'usage_update':
        usageData.value = msg
        break

      default:
        console.warn('[useAudioSession] Unknown message type:', msg.type)
    }
  }

  // ── Tool result → card events ───────────────────────────────────
  const handleToolResult = (msg) => {
    if (msg.name === 'submit_review' && msg.result) {
      const evt = {
        id: ++cardEventIdCounter,
        type: 'reviewed',
        card: msg.result.card || null,
        cardId: msg.result.card_id,
        difficulty: msg.result.difficulty,
        timestamp: Date.now()
      }
      cardEvents.value = [...cardEvents.value, evt]
      // Auto-dismiss after 4s
      setTimeout(() => removeCardEvent(evt.id), 4000)
    } else if (msg.name === 'skip_card_permanently' && msg.result) {
      const evt = {
        id: ++cardEventIdCounter,
        type: 'skipped',
        card: msg.result.card || null,
        cardId: msg.result.card_id,
        difficulty: 'skipped',
        timestamp: Date.now()
      }
      cardEvents.value = [...cardEvents.value, evt]
      setTimeout(() => removeCardEvent(evt.id), 4000)
    }
  }

  const removeCardEvent = (id) => {
    cardEvents.value = cardEvents.value.filter(e => e.id !== id)
  }

  // ── Microphone capture ──────────────────────────────────────────
  const startMicrophone = async () => {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: inputSampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      audioContext = new AudioContext({ sampleRate: inputSampleRate })
      micSource = audioContext.createMediaStreamSource(micStream)

      // ScriptProcessorNode for broad compatibility
      const bufferSize = 4096
      scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1)

      scriptProcessor.onaudioprocess = (e) => {
        if (status.value !== 'active') return

        const float32 = e.inputBuffer.getChannelData(0)
        // Convert Float32 → Int16 PCM
        const int16 = new Int16Array(float32.length)
        for (let i = 0; i < float32.length; i++) {
          const s = Math.max(-1, Math.min(1, float32[i]))
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
        }

        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(int16.buffer)
        }
      }

      micSource.connect(scriptProcessor)
      scriptProcessor.connect(audioContext.destination)
    } catch (e) {
      console.error('[useAudioSession] Microphone error:', e)
      error.value = 'Microphone access denied'
      statusMessage.value = 'Microphone access denied'
    }
  }

  // ── AI audio playback ───────────────────────────────────────────
  const initPlaybackContext = () => {
    playbackContext = new AudioContext({ sampleRate: outputSampleRate })
    nextPlaybackTime = 0

    // Create an AnalyserNode to monitor live playback amplitude
    playbackAnalyser = playbackContext.createAnalyser()
    playbackAnalyser.fftSize = 2048
    playbackAnalyser.smoothingTimeConstant = 0.4
    playbackAnalyser.connect(playbackContext.destination)
    analyserData = new Uint8Array(playbackAnalyser.fftSize)

    startAnalyserLoop()
  }

  const handleAudioData = (arrayBuffer) => {
    if (!playbackContext) return

    aiSpeaking.value = true
    statusMessage.value = 'AI is speaking…'

    const int16 = new Int16Array(arrayBuffer)

    // Convert Int16 → Float32 for Web Audio
    const float32 = new Float32Array(int16.length)
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768
    }

    // Schedule gapless playback through the analyser
    const buffer = playbackContext.createBuffer(1, float32.length, outputSampleRate)
    buffer.getChannelData(0).set(float32)

    const source = playbackContext.createBufferSource()
    source.buffer = buffer

    // Route: source → analyser → destination
    source.connect(playbackAnalyser)

    const now = playbackContext.currentTime
    if (nextPlaybackTime < now) {
      nextPlaybackTime = now
    }
    source.start(nextPlaybackTime)
    nextPlaybackTime += buffer.duration
  }

  const flushPlayback = () => {
    // Reset playback scheduling to drop queued audio
    stopAnalyserLoop()
    if (playbackContext) {
      playbackContext.close().catch(() => {})
      playbackAnalyser = null
      analyserData = null
      playbackContext = null
      initPlaybackContext()
    }
  }

  // ── Cleanup ─────────────────────────────────────────────────────
  const cleanup = () => {
    stopAnalyserLoop()
    if (scriptProcessor) {
      scriptProcessor.disconnect()
      scriptProcessor = null
    }
    if (micSource) {
      micSource.disconnect()
      micSource = null
    }
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop())
      micStream = null
    }
    if (audioContext) {
      audioContext.close().catch(() => {})
      audioContext = null
    }
    if (playbackContext) {
      playbackContext.close().catch(() => {})
      playbackContext = null
    }
    playbackAnalyser = null
    analyserData = null
    ws = null
  }

  // Auto-cleanup on component unmount
  onUnmounted(() => {
    disconnect()
  })

  // ── Public API ──────────────────────────────────────────────────
  return {
    // State (readonly refs)
    status: readonly(status),
    aiSpeaking: readonly(aiSpeaking),
    aiAmplitude: readonly(aiAmplitude),
    sessionId: readonly(sessionId),
    statusMessage: readonly(statusMessage),
    cardEvents: readonly(cardEvents),
    error: readonly(error),
    usageData: readonly(usageData),

    // Actions
    connect,
    disconnect,
    pause,
    resume,
    removeCardEvent
  }
}
