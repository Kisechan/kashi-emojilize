<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { enhanceText } from './services/api'
import type { ApiError } from './types/index'

// 风格定义
const styles = [
  {
    id: 'restrained',
    name: '收敛版',
    example: '☺️我🍰喜欢蛋糕，也喜欢你🥰\n🥄用银匙去敲敲茶托的话就会与古代鱼🐟🌊一起到海底的遗迹旅行！🏛\n你讨厌我了吗？当我那样问道😖❓\n你轻抚我的头🫳😗\n某个家族的御茶会议😌🍵'
  },
  {
    id: 'enhanced',
    name: '加强版',
    example: '那是什么眼神👁️果然是那种眼神😨\n已经不是第一次见到了呢💧\n那是什么眼神快👁️别这样了😱😭\n明明只是可爱❤️却像变成了罪人😔\n脱轨❌脱轨❌崩毁💥\n因一个秘密就崩毁💔\n要坏掉了😭对不起😔💔'
  },
  {
    id: 'symmetric',
    name: '对称版',
    example: '👻任谁的灵魂都充满👻\n💔紫给紫给紫给💔\n🥵痛苦和会愤怒的人😡\n😋都被吃干抹净了😋\n🤔可为何此时此刻仍会🥹\n😭如此不断刺痛着😭'
  }
]

// 状态管理
const inputText = ref('')
const outputText = ref('')
const isLoading = ref(false)
const selectedStyle = ref('enhanced')
const styleDrawerVisible = ref(false)

// 检测屏幕宽度
const isMobile = ref(false)

// 检测操作系统
const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
const isWindows = /Win/i.test(navigator.platform)

// 检测屏幕宽度变化
function updateScreenSize() {
  isMobile.value = window.innerWidth <= 480
}

// 初始化和监听窗口大小变化
if (typeof window !== 'undefined') {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
}

// 计算属性
const isInputEmpty = computed(() => inputText.value.trim().length === 0)
const isDisabled = computed(() => isLoading.value || isInputEmpty.value)
const currentStyleName = computed(() => {
  const style = styles.find(s => s.id === selectedStyle.value)
  return style ? style.name : '未知风格'
})

// 处理 emoji 增强
async function handleEnhance() {
  if (isDisabled.value) return

  isLoading.value = true

  try {
    const enhanced = await enhanceText(
      inputText.value,
      selectedStyle.value
    )
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

// 选择风格
function selectStyle(styleId: string) {
  selectedStyle.value = styleId
}

// 拖拽相关代码已删除，将来可能可用于浮动按钮功能
</script>

<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="header-content">
        <img src="./assets/icon.jpg" alt="Emoji 增强工具" class="header-icon" draggable="false" />
        <div class="title-block">
          <h1 class="header-title">歌词 Emoji 化小工具</h1>
          <h2 class="subtitle">Vocaloid Kashi Emojilize</h2>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <el-main class="app-main">
      <div class="content-wrapper">
        <!-- 左侧：输入框 -->
        <div class="input-section">
          <p class="style-indicator">
            当前生成风格：<span class="style-name-badge" @click="styleDrawerVisible = true">{{ currentStyleName }}</span>
          </p>
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="12"
            placeholder="输入歌词或文案..."
            maxlength="5000"
            show-word-limit
            :autosize="{ minRows: 16, maxRows: 24 }"
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
              description="输出结果将显示于此"
              :image-size="80"
            />
            <div v-else class="output-text">
              {{ outputText }}
            </div>
          </div>
        </div>
      </div>
    </el-main>

    <!-- 风格选择悬浮窗 -->
    <div class="style-drawer-wrapper">
      <el-drawer
        v-model="styleDrawerVisible"
        :direction="isMobile ? 'btt' : 'rtl'"
        :size="isMobile ? '680px' : '360px'"
        :close-on-click-modal="true"
        :close-on-press-escape="true"
        :show-close="true"
        :class="{ 'drawer-mobile': isMobile }"
      >
        <template #header>
          <h2 class="drawer-title">选择生成风格</h2>
        </template>
        <div class="style-list">
          <!-- 风格选项 -->
          <el-radio-group v-model="selectedStyle" class="style-radio-group">
            <div 
              v-for="(style, index) in styles" 
              :key="style.id" 
              class="style-card"
              :class="{ 'is-selected': selectedStyle === style.id }"
              :style="{ animationDelay: `${index * 0.1}s` }"
              @click="selectStyle(style.id)"
            >
              <div class="style-card-header">
                <el-radio :value="style.id" size="large">
                  <span class="style-name">{{ style.name }}</span>
                </el-radio>
              </div>
              
              <!-- 示例文本 -->
              <div class="example-box">
                <div class="example-text">{{ style.example }}</div>
              </div>
            </div>
          </el-radio-group>
        </div>
      </el-drawer>
    </div>

    <!-- 风格选择按钮（可拖拽浮动） [已禁用 - 改为点击风格名称打开] -->
    <!-- 
    <div 
      class="style-toggle-button"
      :class="{ 'is-dragging': isDragging }"
      :style="{ left: buttonPosition.x + 'px', top: buttonPosition.y + 'px' }"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @click.stop="!hasMoved && (styleDrawerVisible = true)"
    >
      <div class="toggle-button-inner">
        <el-icon :size="28"><Setting /></el-icon>
      </div>
    </div>
    -->

    <!-- 页脚 -->
    <el-footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2026 Kisechan | <a href="https://github.com/Kisechan/kashi-emojilize" target="_blank" rel="noopener noreferrer">GitHub</a></p>
        <p>Built with Vue3 / Vite / Element Plus</p>
      </div>
    </el-footer>
  </div>
</template>

