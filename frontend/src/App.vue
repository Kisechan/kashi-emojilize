<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { enhanceText } from './services/api'
import type { ApiError } from './types/index'

// 状态管理
const inputText = ref('')
const outputText = ref('')
const isLoading = ref(false)

// 检测操作系统
const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
const isWindows = /Win/i.test(navigator.platform)

// 计算属性
const isInputEmpty = computed(() => inputText.value.trim().length === 0)
const isDisabled = computed(() => isLoading.value || isInputEmpty.value)

// 处理 emoji 增强
async function handleEnhance() {
  if (isDisabled.value) return

  isLoading.value = true

  try {
    const enhanced = await enhanceText(inputText.value)
    outputText.value = enhanced
    ElMessage.success('提交成功！')
  } catch (error) {
    const apiError = error as ApiError
    ElMessage.error(apiError.message || '增强失败，请稍后重试')
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
}

// 复制输出文本到剪贴板
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(outputText.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请重试')
  }
}
</script>

<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="header-content">
        <img src="./assets/icon.jpg" alt="Emoji 增强工具" class="header-icon" />
        <h1 class="header-title">歌词 Emoji 化小工具</h1>
      </div>
    </div>

    <!-- 主内容区 -->
    <el-main class="app-main">
      <div class="content-wrapper">
        <!-- 左侧：输入框 -->
        <div class="input-section">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="12"
            placeholder="输入歌词或文案..."
            maxlength="5000"
            show-word-limit
            :autosize="{ minRows: 12, maxRows: 20 }"
            @keydown="handleKeydown"
          />
          <p class="hint">
            <template v-if="isMac">
              <kbd>⌘</kbd>+<kbd>Enter</kbd> 快速提交 | 最多 5000 字
            </template>
            <template v-else-if="isWindows">
              <kbd>Ctrl</kbd>+<kbd>Enter</kbd> 快速提交 | 最多 5000 字
            </template>
            <template v-else>
              最多 5000 字
            </template>
          </p>
        </div>

        <!-- 中间：按钮组 -->
        <div class="button-section">
          <el-button
            type="success"
            size="large"
            :loading="isLoading"
            :disabled="isDisabled"
            @click="handleEnhance"
          >
            {{ isLoading ? '处理中' : '提交' }}
          </el-button>
          <el-button
            type="default"
            size="large"
            :disabled="isLoading"
            @click="clearInput"
          >
            清空
          </el-button>
          <el-button
            v-if="outputText"
            type="warning"
            size="large"
            @click="copyToClipboard"
          >
            复制
          </el-button>
        </div>

        <!-- 右侧：输出框 -->
        <div class="output-section">
          <div class="output-container">
            <el-empty
              v-if="!outputText"
              description="增强结果将显示于此"
              :image-size="80"
            />
            <div v-else class="output-text">
              {{ outputText }}
            </div>
          </div>
        </div>
      </div>
    </el-main>

    <!-- 页脚 -->
    <el-footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2026 Kisechan | <a href="https://github.com/Kisechan/kashi-emojilize" target="_blank" rel="noopener noreferrer">GitHub</a></p>
      </div>
    </el-footer>
  </div>
</template>

