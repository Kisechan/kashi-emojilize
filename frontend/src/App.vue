<script setup lang="ts">
import { ref, computed } from 'vue'
import { enhanceText } from './services/api'
import type { ApiError } from './types/index'

// 状态管理
const inputText = ref('')
const outputText = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 计算属性
const isInputEmpty = computed(() => inputText.value.trim().length === 0)
const isDisabled = computed(() => isLoading.value || isInputEmpty.value)

// 处理 emoji 增强
async function handleEnhance() {
  if (isDisabled.value) return

  // 清空错误和成功提示
  errorMessage.value = ''
  successMessage.value = ''
  outputText.value = ''

  isLoading.value = true

  try {
    const enhanced = await enhanceText(inputText.value)
    outputText.value = enhanced
    successMessage.value = '提交成功！'
    
    // 3 秒后清除成功提示
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    const apiError = error as ApiError
    errorMessage.value = apiError.message || '增强失败，请稍后重试'
    console.error('API 错误:', apiError)
  } finally {
    isLoading.value = false
  }
}

// 处理输入框回车（Ctrl/Cmd + Enter 提交）
function handleKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    handleEnhance()
  }
}

// 清空输入
function clearInput() {
  inputText.value = ''
  outputText.value = ''
  errorMessage.value = ''
  successMessage.value = ''
}

// 复制输出文本到剪贴板
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(outputText.value)
    successMessage.value = '已复制到剪贴板'
    setTimeout(() => {
      successMessage.value = ''
    }, 2000)
  } catch {
    errorMessage.value = '复制失败，请重试'
  }
}
</script>

<template>
  <div class="container">
    <main class="main">
      <!-- 标题 -->
      <h1 class="title">歌词 Emoji 化工具</h1>

      <!-- 三栏布局 -->
      <div class="layout">
        <!-- 左侧：输入框 -->
        <section class="panel input-panel">
          <textarea
            v-model="inputText"
            class="textarea"
            placeholder="输入文案..."
            @keydown="handleKeydown"
          ></textarea>
          <p class="hint"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> 快速提交</p>
        </section>

        <!-- 中间：按钮 -->
        <section class="panel button-panel">
          <button
            class="btn btn-primary"
            :disabled="isDisabled"
            :class="{ loading: isLoading }"
            @click="handleEnhance"
          >
            <span v-if="!isLoading">提交</span>
            <span v-else>处理中</span>
          </button>
          <button
            class="btn btn-secondary"
            :disabled="isLoading"
            @click="clearInput"
          >
            清空
          </button>
          <button
            v-if="outputText"
            class="btn btn-secondary"
            @click="copyToClipboard"
          >
            复制
          </button>
        </section>

        <!-- 右侧：输出框 -->
        <section class="panel output-panel">
          <div class="output-box">
            <p v-if="outputText" class="output-text">{{ outputText }}</p>
            <p v-else class="output-placeholder">增强结果将显示于此</p>
          </div>
        </section>
      </div>
    </main>

    <!-- 消息弹窗 -->
    <transition name="fade">
      <div v-if="errorMessage" class="error-modal">
        <div class="modal-overlay" @click="errorMessage = ''">
          <div class="modal-content" @click.stop>
            <div class="modal-body">
              {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="successMessage" class="success-modal">
        <div class="modal-overlay" @click="successMessage = ''">
          <div class="modal-content" @click.stop>
            <div class="modal-body">
              {{ successMessage }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

