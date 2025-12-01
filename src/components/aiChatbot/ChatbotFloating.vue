<template>
  <div>
    <!-- Chat Window -->
    <div class="chatbot-window" v-show="isOpen">
      <div class="chat-header">
        <div class="header-left">
          <el-button
            v-if="!showHomepage"
            class="header-back"
            @click="goHome"
            aria-label="Back to chatbot homepage"
            text
            circle
          >
            <el-icon><ArrowLeft /></el-icon>
          </el-button>

          <!-- Title -> el-text -->
          <el-text class="title" tag="span" truncated>FPS AI Chatbot</el-text>
        </div>

        <div class="header-right">
          <!-- Clear chat keeps its slot; just hidden on homepage -->
          <div class="header-icon" :class="{ 'is-hidden': showHomepage }">
            <el-tooltip content="Clear Chat History" placement="bottom">
              <el-button text circle type="default" aria-label="Clear chat" @click="clearChat" :disabled="isResponding">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </div>

          <!-- Close (X) -->
          <el-button class="header-close" @click="isOpen = false" aria-label="Close" text circle>
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- Homepage -->
      <div
        v-if="showHomepage"
        class="chat-homepage gradient-homepage"
        role="region"
        aria-label="Chatbot introduction and quick questions"
      >
        <!-- Hero heading -> el-text -->
        <el-text class="hero-title" tag="h1" type="primary">
          Welcome to the<br />
          FPS AI Chatbot <span class="wave" aria-hidden="true">👋</span>
        </el-text>

        <!-- Chips -->
        <div class="chip-group" role="group" aria-label="Common questions">
          <button class="chip chip--outline" @click="startChat('What is FPS MES?')">What Is FPS MES</button>
          <button class="chip chip--outline" @click="startChat('How does this AI Chatbot work?')">
            How Does This AI Chatbot Work
          </button>
          <button class="chip chip--outline" @click="startChat('How to operate the packaging machine?')">
            How To Operate The Packaging Machine
          </button>
          <button class="chip chip--outline" @click="startChat('How to initialize the metal detector?')">
            How To Initialize The Metal Detector
          </button>
          <button class="chip chip--outline" @click="startChat('X-Ray machine spare parts?')">
            X-Ray Machine Spare Parts
          </button>
          <button class="chip chip--outline" @click="startChat('How to initialize the metal detector?')">
            How To Initialize The Metal Detector
          </button>
          <button class="chip chip--outline" @click="startChat('X-Ray machine spare parts?')">
            X-Ray Machine Spare Parts
          </button>
        </div>

        <!-- Start Conversation (bottom call-to-action) -->
        <div
          class="start-convo"
          :class="{ hovering: isHovering }"
          @mousemove="onMove"
          @mouseenter="isHovering = true"
          @mouseleave="resetHover"
          @click="startChat('Hi chatbot')"
        >
          <div class="sc-left">
            <el-icon :size="20"><ChatDotSquare /></el-icon>
            <!-- CTA label -> el-text -->
            <el-text tag="b">Start Conversation</el-text>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div v-else class="chat-body" ref="bodyRef" role="log" aria-live="polite" @scroll="onBodyScroll">
        <div
          v-for="(m, i) in messages"
          :key="i"
          class="message"
          :class="[m.role === 'user' ? 'user-message' : 'ai-message', m.loading ? 'is-loading' : '']"
        >
          <img
            v-if="m.role === 'ai'"
            class="avatar"
            :src="aiAvatar"
            alt="AI"
            :aria-busy="m.loading ? 'true' : 'false'"
          />
          <div class="bubble">
            <span v-if="m.loading" class="typing-dots" aria-hidden="true">
              <span class="dot d1"></span>
              <span class="dot d2"></span>
              <span class="dot d3"></span>
            </span>
            <!-- Message text -> el-text (keeps pre-wrap) -->
            <el-text v-else class="bubble-text" tag="span" :style="{ whiteSpace: 'pre-wrap' }">
              {{ m.content }}
            </el-text>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div
        v-if="!showHomepage"
        ref="inputWrapRef"
        class="chat-input fancy-input"
        :class="{ 'is-focused': inputFocused, 'is-busy': isResponding }"
      >
        <textarea
          ref="textareaRef"
          v-model="userInput"
          class="chat-textarea"
          placeholder="Type your message…"
          rows="1"
          maxlength="8000"
          @focus="inputFocused = true"
          @blur="inputFocused = false"
          @input="autoResize"
          @keydown.enter.exact="onEnter"
          @keydown.shift.enter.exact="onShiftEnter"
        ></textarea>

        <div class="input-actions">
          <!-- Stop icon (purely visual, no red disabled styles) -->
          <button
            v-if="isResponding"
            type="button"
            class="icon-btn stop-btn"
            aria-label="Wait while generating"
            title="Wait while generating"
            @click.stop.prevent
          >
            <span class="stop-icon"></span>
          </button>

          <!-- Send button -->
          <button v-else type="button" class="icon-btn send-btn" aria-label="Send" title="Send" @click="sendMessage">
            <img src="../../icons/svg/send.svg" alt="Send" width="20" height="20" class="send-icon" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { askAIChatbot } from '@/api/ai-chatbot'
import { ChatDotSquare, ArrowLeft, Close, Delete } from '@element-plus/icons-vue'
import aiChatbotImgUrl from '@/assets/imgs/ai-chatbot-fps.png?url'

/** Parent controls open/close via v-model:open */
const props = defineProps( {
  open : { type : Boolean, default : false }
} )
const emit = defineEmits( ['update:open'] )

/** Proxy prop <-> internal state */
const isOpen = computed( {
  get : () => props.open,
  set : v => emit( 'update:open', v )
} )

/** Hover gradient for CTA */
const isHovering = ref( false )
const gradientPos = ref( { x : 50, y : 50 } )

function onEnter( e ) {
  if ( isResponding.value ) {
    e.preventDefault() // block everything if busy
    return
  }
  // plain Enter → send
  e.preventDefault()
  sendMessage()
}

function onShiftEnter( e ) {
  if ( isResponding.value ) {
    e.preventDefault() // block newline if busy
  }
  // else: Shift+Enter inserts newline automatically (don’t call preventDefault)
}

function onMove( e ) {
  const rect = e.currentTarget.getBoundingClientRect()
  gradientPos.value = {
    x : ( ( e.clientX - rect.left ) / rect.width ) * 100,
    y : ( ( e.clientY - rect.top ) / rect.height ) * 100
  }
  e.currentTarget.style.background = `radial-gradient(circle at ${gradientPos.value.x}% ${gradientPos.value.y}%, #d9ecff, #ffffff 60%)`
}
function resetHover( e ) {
  isHovering.value = false
  e.currentTarget.style.background = '#fff'
}

/** View state */
const showHomepage = ref( true )
function goHome() {
  showHomepage.value = true
}

/** Chat state */
const aiAvatar = aiChatbotImgUrl
const messages = ref( [] )

const userInput = ref( '' )
const inputFocused = ref( false )
const textareaRef = ref( null )
const bodyRef = ref( null )
const isResponding = ref( false )
// Abort controller + pointer to the current "typing" placeholder
const aborter = ref( null )
const lastTypingMsg = ref( null )

function startChat( question ) {
  showHomepage.value = false
  userInput.value = question
  sendMessage()
}

// UPDATE sendMessage()
async function sendMessage() {
  if ( isResponding.value ) return
  const text = userInput.value.trim()
  if ( !text ) return

  showHomepage.value = false
  messages.value.push( { role : 'user', content : text } )
  userInput.value = ''
  await nextTick()
  autoResize()
  scrollToBottom()

  const typingMsg = { role : 'ai', loading : true }
  messages.value.push( typingMsg )
  lastTypingMsg.value = typingMsg // ⬅️ remember the typing bubble
  isResponding.value = true

  // ⬇️ create abort controller per request
  aborter.value = new AbortController()

  try {
    const data = await askAIChatbot( text )
    const reply = ( data?.response || '' ).toString().trim() || 'Sorry, I could not find an answer.'
    replaceTyping( typingMsg, reply )
  } catch ( e ) {
    // If aborted, just stop silently; otherwise show error
    if ( e?.name !== 'AbortError' ) {
      replaceTyping( typingMsg, `⚠️ ${e?.message || 'Unknown error'}` )
    } else {
      // remove the typing bubble if still there
      const i = messages.value.indexOf( typingMsg )
      if ( i !== -1 ) messages.value.splice( i, 1 )
    }
  } finally {
    isResponding.value = false
    aborter.value = null
    lastTypingMsg.value = null
    await nextTick()
    scrollToBottom()
  }
}

function replaceTyping( typingMsg, content ) {
  const idx = messages.value.indexOf( typingMsg )
  if ( idx !== -1 ) messages.value.splice( idx, 1, { role : 'ai', content } )
  else messages.value.push( { role : 'ai', content } )
}

function autoResize() {
  const ta = textareaRef.value
  if ( !ta ) return
  ta.style.height = 'auto'
  const max = 160
  ta.style.height = Math.min( ta.scrollHeight, max ) + 'px'
  ta.style.overflowY = ta.scrollHeight > max ? 'auto' : 'hidden'
}

/** Autoscroll */
const autoscroll = ref( true )
const SCROLL_EPS = 24
function isNearBottom( el ) {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_EPS
}
function onBodyScroll() {
  const el = bodyRef.value
  if ( !el ) return
  autoscroll.value = isNearBottom( el )
}
function scrollToBottom( force = false ) {
  const el = bodyRef.value
  if ( !el ) return
  if ( !force && !autoscroll.value && !isNearBottom( el ) ) return
  requestAnimationFrame( () => {
    requestAnimationFrame( () => {
      el.scrollTop = el.scrollHeight
    } )
  } )
}

function clearChat() {
  messages.value = []
  startChat( 'Start new chat' )
}

// function onHeaderMenu( cmd ) {
//   if ( cmd === 'clear' ) clearChat()
// }

/** Focus textarea on open */
watch( isOpen, open => {
  if ( open ) {
    nextTick( () => {
      autoResize()
      textareaRef.value?.focus()
    } )
  }
} )

/** Initial sizing */
onMounted( () => {
  nextTick( () => {
    autoResize()
    scrollToBottom()
  } )

  // graceful hover reset for CTA if needed (duplicate-safe)
  const el = document.querySelector( '.start-convo' )
  if ( !el ) return
  el.addEventListener( 'mousemove', e => {
    const rect = el.getBoundingClientRect()
    const x = ( ( e.clientX - rect.left ) / rect.width ) * 100
    const y = ( ( e.clientY - rect.top ) / rect.height ) * 100
    el.style.background = `radial-gradient(circle at ${x}% ${y}%, #d9ecff, #ffffff 80%)`
  } )
  el.addEventListener( 'mouseleave', () => {
    el.style.background = '#fff'
  } )
} )
</script>

<style scoped>
/* keep your generic icon button */
.icon-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
}

/* keep your generic .icon-btn as-is */

/* Stop button look & feel like ChatGPT */
.icon-btn.stop-btn {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background-color: #e6e6e6 !important; /* consistent grey */
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer; /* 👈 hand cursor */
  pointer-events: auto; /* 👈 allow hover state */
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.icon-btn.stop-btn:hover {
  background-color: #dcdcdc; /* subtle darken on hover */
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

/* inner square */
.icon-btn.stop-btn .stop-icon {
  width: 10px;
  height: 10px;
  background: #444;
  border-radius: 2px;
}

/* Window */
.chatbot-window {
  position: fixed;
  bottom: 40px;
  right: 30px;
  width: 360px;
  height: 75vh;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 2147483648;
  overflow: hidden;
}

/* Header */
.chat-header {
  background: #fff;
  color: #111;
  font-weight: 500;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  height: 52px;
  position: relative;
  box-sizing: border-box;
  padding: 0 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 4px; /* smaller gap instead of 10px */
}

.chat-header .title {
  font-size: 16px;
  font-weight: 550;
  line-height: 1.2;
  white-space: nowrap;
  padding-left: 18px; /* was 28px — nudged a little */
}
.header-back {
  position: absolute;
  left: 2px; /* was 8px, now closer to the edge */
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* keep hover vars */
  --el-button-hover-bg-color: rgba(0, 0, 0, 0.06);
  --el-button-hover-text-color: #111;
  --el-button-hover-border-color: transparent;
}

.header-close {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  width: 32px; /* make circle visible */
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* in case Element Plus vars are used */
  --el-button-hover-bg-color: rgba(0, 0, 0, 0.06);
  --el-button-hover-text-color: #111;
  --el-button-hover-border-color: transparent;
}
/* Fix: X and … should sit side-by-side inside header-right */
.header-right .header-close {
  position: static;
  right: auto;
  top: auto;
  transform: none;
}
.header-right {
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 2px; /* was 6px – tighten the spacing */
}

.header-right .el-button {
  margin: 0; /* kill any extra margin */
  padding: 0; /* remove Element Plus inner spacing */
  width: 28px; /* smaller circle if desired */
  height: 28px;
}

/* fixed-size slot so layout never jumps when hidden */
.header-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* hide visually but keep the space */
.header-icon.is-hidden {
  visibility: hidden;
}

/* explicit hover so it shows even with 'text' variant */
.header-back:hover,
.header-back:focus-visible,
.header-close:hover,
.header-close:focus-visible {
  background-color: rgba(0, 0, 0, 0.06);
}

/* Homepage gradient - softer */
.gradient-homepage {
  flex: 1;
  padding: 28px 28px;
  background-color: #ffffff;
  background-image: radial-gradient(
    480px 320px at 20% 12%,
    #a3cdf9 0%,
    /* softer light blue */ #c1defa 20%,
    /* more neutral */ #daeafc 40%,
    /* closer to gray-white */ #e8f2fd 60%,
    /* very soft */ #f5faff 75%,
    /* almost white */ #ffffff 90% /* pure white */
  );
  background-repeat: no-repeat;
  color: #111;
  overflow-y: auto;
}

.hero-title {
  font-size: 24px;
  margin: 0 0 18px;
  color: #fff;
}

/* Chips */
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  border: 1px solid transparent;
  background: #fff;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}
.chip--outline {
  --chip-blue: #409eff;
  border-color: var(--chip-blue);
  color: var(--chip-blue);
}
.chip--outline:hover {
  background: #d9ecff;
}

/* Messages */
.chat-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.message {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.ai-message {
  align-items: flex-start;
}
.user-message {
  justify-content: flex-end;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

/* Bubbles */
/* Common bubble base */
.bubble {
  position: relative;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 70%;
  word-wrap: break-word;
  line-height: 1.35;
  white-space: pre-wrap;
}

/* AI bubble */
.ai-message .bubble {
  background: #f1f1f1;
  color: #111;
}
.ai-message .bubble::after {
  content: '';
  position: absolute;
  top: 8px; /* adjust how high the tail sits */
  left: -6px; /* stick out on the left */
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #f1f1f1; /* match bg */
}

/* User bubble */
.user-message .bubble {
  background: #ecf5ff; /* Element Plus light blue */
  color: #111;
}
.user-message .bubble::after {
  content: '';
  position: absolute;
  top: 8px; /* same vertical as AI tail */
  right: -6px; /* stick out on the right */
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid #ecf5ff; /* match bg */
}

/* Typing dots */
.typing-dots {
  display: inline-flex;
  gap: 4px;
}
.typing-dots span {
  width: 6px;
  height: 6px;
  background: #555;
  border-radius: 50%;
  display: inline-block;
  animation: bounce 1.2s infinite;
}
.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}
.typing-dots span:nth-child(4) {
  animation-delay: 0.6s;
}
.typing-dots span:nth-child(5) {
  animation-delay: 0.8s;
}
.typing-dots span:nth-child(6) {
  animation-delay: 1s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.6;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Input */
.fancy-input {
  margin: 0 16px 16px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  border-radius: 12px;
  background: #fff;
  border: 1.5px solid #f4f4f5;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
.chat-textarea {
  flex: 1;
  outline: none;
  background: transparent;

  /* ✅ Match Element Plus text */
  font-family: var(--el-font-family);
  font-size: var(--el-font-size-base, 14px);
  line-height: 1.5715;
  color: var(--el-text-color-regular, #303133);

  resize: none;
  max-height: 160px;
}

/* Placeholder to match EP style */
.chat-textarea::placeholder {
  font-family: var(--el-font-family);
  font-size: var(--el-font-size-base, 14px);
  line-height: 1.5715;
  color: var(--el-text-color-placeholder, #a8abb2);
  opacity: 1;
}

.input-actions {
  display: flex;
  gap: 6px;
  margin-left: 6px;
}
.icon-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
}
.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* CTA */
.start-convo {
  position: absolute;
  left: 28px; /* match .chat-body and .gradient-homepage padding */
  right: 28px;
  bottom: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px; /* slightly larger horizontal padding to balance */
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  user-select: none;
  z-index: 10;
  transition: background 0.2s ease;
}

.start-convo:hover {
  background: linear-gradient(135deg, #d9ecff 0%, #ecf5ff 60%, #ffffff 100%);
}
.sc-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Wave */
.wave {
  display: inline-block;
  margin-left: 6px;
  transform-origin: 70% 70%;
  animation: wave-hand 2.5s ease-in-out infinite;
}
@keyframes wave-hand {
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(14deg);
  }
  20% {
    transform: rotate(-8deg);
  }
  30% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(10deg);
  }
  60%,
  100% {
    transform: rotate(0deg);
  }
}
/* ✅ Remove harsh red highlight on disabled inputs/buttons */
.chat-textarea:disabled,
.icon-btn:disabled {
  border-color: #ddd !important; /* soft gray border */
  background-color: #f9f9f9 !important; /* subtle light bg */
  color: #999 !important; /* muted text */
  box-shadow: none !important; /* kill red glow */
  outline: none !important;
}

/* Optional: tweak the placeholder too */
.chat-textarea:disabled::placeholder {
  color: #bbb !important;
}

@media (prefers-reduced-motion: reduce) {
  .wave {
    animation: none;
  }
}
@media (min-width: 1440px) {
  .chatbot-window {
    width: 420px; /* fixed, as before */
  }
  .chat-header {
    padding: 0 10px !important; /* larger header padding */
  }
  .chat-header .title {
    padding-left: 32px; /* small extra nudge on big screens */
    font-size: 18px;
  }
  .gradient-homepage {
    padding: 40px 38px !important;
  }
  .chip {
    font-size: 15px; /* slightly bigger */
    padding: 11px 18px; /* just a touch more padding */
    border-radius: 12px; /* keep consistent look */
  }

  .chip-group {
    gap: 14px; /* a little extra space between chips */
  }
  .start-convo {
    left: 38px; /* match large screen .gradient-homepage padding */
    right: 38px;
    bottom: 38px;
    padding: 16px 22px; /* scale up slightly */
  }
}
/* Kill Element Plus' default hover/focus glow on the BACK button */
.header-back.el-button.is-text:not(.is-disabled):hover,
.header-back.el-button.is-text:not(.is-disabled):focus,
.header-back.el-button:focus-visible,
.header-back.el-button.is-text:active {
  background-color: transparent !important; /* remove EP hover */
  box-shadow: none !important;
  border-color: transparent !important;
}

/* Provide your own subtle hover (visible on any background) */
.header-back:hover {
  background-color: rgba(0, 0, 0, 0.06) !important;
  border-radius: 50%;
}

/* Optional: also prevent the variable-driven EP hover from kicking in */
.header-back.el-button {
  --el-button-hover-bg-color: transparent;
  --el-button-hover-text-color: inherit;
  --el-button-hover-border-color: transparent;
}
.send-icon {
  display: block;
  width: 20px;
  height: 20px;
}
/* Larger + lighter gradient on big screens */
@media (min-width: 1440px) {
  .gradient-homepage {
    background-image: radial-gradient(
      720px 480px at 20% 12%,
      #a3cdf9 0%,
      #c1defa 20%,
      #daeafc 40%,
      #e8f2fd 60%,
      #f5faff 75%,
      #ffffff 90%
    );
    padding: 40px 38px; /* more breathing room */
  }
}
</style>
