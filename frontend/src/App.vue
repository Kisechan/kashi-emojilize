<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { enhanceText } from "./services/api";
import type { ApiError } from "./types/index";

// 风格定义
const styles = [
  {
    id: "restrained",
    name: "收敛版",
    example:
      "☺️我🍰喜欢蛋糕，也喜欢你🥰\n🥄用银匙去敲敲茶托的话就会与古代鱼🐟🌊一起到海底的遗迹旅行！🏛\n你讨厌我了吗？当我那样问道😖❓\n你轻抚我的头🫳😗\n某个家族的御茶会议😌🍵",
  },
  {
    id: "enhanced",
    name: "加强版",
    example:
      "那是什么眼神👁️果然是那种眼神😨\n已经不是第一次见到了呢💧\n那是什么眼神快👁️别这样了😱😭\n明明只是可爱❤️却像变成了罪人😔\n脱轨❌脱轨❌崩毁💥\n因一个秘密就崩毁💔\n要坏掉了😭对不起😔💔",
  },
  {
    id: "symmetric",
    name: "对称版",
    example:
      "👻任谁的灵魂都充满👻\n💔紫给紫给紫给💔\n🥵痛苦和会愤怒的人😡\n😋都被吃干抹净了😋\n🤔可为何此时此刻仍会🥹\n😭如此不断刺痛着😭",
  },
];

// 状态管理
const inputText = ref("");
const outputText = ref("");
const isLoading = ref(false);
const selectedStyle = ref("enhanced");
const selectedIgnoreMode = ref("none");
const styleDrawerVisible = ref(false);
const ignoreDrawerVisible = ref(false);
const showWelcomeDialog = ref(false);
const maintenanceModeEnabled = ref(false);

// 检测屏幕宽度
const isMobile = ref(false);

// 检测操作系统
const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
const isWindows = /Win/i.test(navigator.platform);

// 检测屏幕宽度变化
function updateScreenSize() {
  isMobile.value = window.innerWidth <= 480;
}

// 初始化和监听窗口大小变化
if (typeof window !== "undefined") {
  updateScreenSize();
  window.addEventListener("resize", updateScreenSize);
}

// 首次访问检查
onMounted(() => {
  const hasVisited = localStorage.getItem("kashi-emojilize-visited");
  if (!hasVisited) {
    showWelcomeDialog.value = true;
    localStorage.setItem("kashi-emojilize-visited", "true");
  }

  // 初始化 Turnstile 小组件
  initTurnstile();
});

// 计算属性
const filteredInputText = computed(() =>
  getFilteredText(inputText.value, selectedIgnoreMode.value)
);
const isFilteredInputEmpty = computed(
  () => filteredInputText.value.trim().length === 0
);
const isDisabled = computed(
  () => isLoading.value || isFilteredInputEmpty.value || !turnstileToken.value
);
const currentStyleName = computed(() => {
  const style = styles.find((s) => s.id === selectedStyle.value);
  return style ? style.name : "未知风格";
});
const currentIgnoreModeName = computed(() => {
  const mode = ignoreModes.find((m) => m.id === selectedIgnoreMode.value);
  return mode ? mode.name : "不忽略任何行";
});

const ignoreExampleLines = [
  "僕らは命に嫌われている",
  "我们被生命厌恶着",
  "軽々しく死にたいだとか",
  "轻飘飘地说出「想死」这种话",
  "軽々しく命を見てる僕らは",
  "如此轻贱生命的我们",
  "命に嫌われている",
  "被生命厌恶着",
];

const ignoreModes = [
  {
    id: "none",
    name: "保留所有行",
    description: "不进行任何处理",
  },
  {
    id: "odd",
    name: "忽略奇数行",
    description: "过滤第 1, 3, 5... 行",
  },
  {
    id: "even",
    name: "忽略偶数行",
    description: "过滤第 2, 4, 6... 行",
  },
];

function shouldIgnoreLine(lineIndex: number, modeId: string) {
  const lineNumber = lineIndex + 1;
  if (modeId === "odd") return lineNumber % 2 === 1;
  if (modeId === "even") return lineNumber % 2 === 0;
  return false;
}

function getFilteredText(text: string, modeId: string) {
  const lines = text.split(/\r?\n/);
  if (modeId === "none") return text;
  return lines
    .filter((_, index) => !shouldIgnoreLine(index, modeId))
    .join("\n");
}

// 处理 emoji 增强
async function handleEnhance() {
  if (isDisabled.value) return;

  isLoading.value = true;

  try {
    const enhanced = await enhanceText(
      filteredInputText.value,
      selectedStyle.value,
      turnstileToken.value
    );
    outputText.value = enhanced;
    ElMessage.success("提交成功！");
  } catch (error) {
    const apiError = error as ApiError;
    ElMessage.error(apiError.message || "增强失败，请稍后重试");
    console.error("API 错误:", apiError);
  } finally {
    isLoading.value = false;
    resetTurnstile();
  }
}

// 处理输入框回车（Ctrl/Cmd + Enter 提交）
function handleKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    handleEnhance();
  }
}

// 清空输入
function clearInput() {
  inputText.value = "";
  outputText.value = "";
}

// 复制输出文本到剪贴板
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(outputText.value);
    ElMessage.success("已复制到剪贴板");
  } catch {
    ElMessage.error("复制失败，请重试");
  }
}

// 选择风格
function selectStyle(styleId: string) {
  selectedStyle.value = styleId;
}

function selectIgnoreMode(modeId: string) {
  selectedIgnoreMode.value = modeId;
}

// 拖拽相关代码已删除，将来可能可用于浮动按钮功能
// Turnstile 人机验证
const turnstileRef = ref<HTMLElement | null>(null);
const turnstileToken = ref("");
const turnstileWidgetId = ref<string | null>(null);

function initTurnstile() {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  if (!siteKey) {
    console.warn("[Turnstile] VITE_TURNSTILE_SITE_KEY 未配置，跳过人机验证");
    return;
  }
  const tryRender = () => {
    if (window.turnstile && turnstileRef.value) {
      turnstileWidgetId.value = window.turnstile.render(turnstileRef.value, {
        sitekey: siteKey,
        callback: (token: string) => {
          turnstileToken.value = token;
        },
        "error-callback": () => {
          turnstileToken.value = "";
        },
        "expired-callback": () => {
          turnstileToken.value = "";
        },
        theme: "light",
      });
    } else {
      setTimeout(tryRender, 100);
    }
  };
  tryRender();
}

function resetTurnstile() {
  if (window.turnstile && turnstileWidgetId.value !== null) {
    window.turnstile.reset(turnstileWidgetId.value);
    turnstileToken.value = "";
  }
}
// 打开欢迎对话框
function openWelcomeDialog() {
  showWelcomeDialog.value = true;
}
</script>

<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="header-content">
        <img
          src="./assets/icon.jpg"
          alt="Emoji 增强工具"
          class="header-icon"
          draggable="false"
        />
        <div class="title-block">
          <h1 class="header-title">歌词 Emoji 化小工具</h1>
          <h2 class="subtitle">Vocaloid Kashi Emojilize</h2>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <el-main class="app-main">
      <template v-if="maintenanceModeEnabled">
        <section class="maintenance-panel" aria-live="polite">
          <div class="maintenance-panel__content">
            <p class="maintenance-panel__title">系统公告</p>
            <p class="maintenance-panel__text">
                服务当前正在维护中，请用户稍安勿躁～
            </p>
          </div>
        </section>
      </template>

      <div class="content-wrapper">
        <!-- 左侧：输入框 -->
        <div class="input-section">
          <div class="style-indicator-row">
            <p class="style-indicator">
              当前生成风格：<span
                class="style-name-badge"
                @click="styleDrawerVisible = true"
                >{{ currentStyleName }}</span
              >
            </p>
            <span
              class="style-name-badge ignore-mode-badge"
              @click="ignoreDrawerVisible = true"
              title="设置忽略行规则"
            >
              {{ currentIgnoreModeName }}
            </span>
            <span
              class="style-name-badge help-badge"
              @click="openWelcomeDialog"
              title="查看功能说明"
            >
              使用说明
            </span>
          </div>
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
            <template v-else> 最多 5000 字 </template>
          </p>
          <p class="hint">
            如果不能点击提交按钮，有可能是触发了后台人机验证，无需刷新等待一会儿即可～
          </p>          <!-- Turnstile 人机验证小组件 -->
          <div ref="turnstileRef" class="turnstile-widget"></div>
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
            {{ isLoading ? "处理中" : "提交" }}
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

    <!-- 忽略行规则选择抽屉 -->
    <div class="ignore-drawer-wrapper">
      <el-drawer
        v-model="ignoreDrawerVisible"
        :direction="isMobile ? 'btt' : 'rtl'"
        :size="isMobile ? '680px' : '360px'"
        :close-on-click-modal="true"
        :close-on-press-escape="true"
        :show-close="true"
        :class="{ 'drawer-mobile': isMobile }"
      >
        <template #header>
          <h2 class="drawer-title">选择忽略行规则</h2>
        </template>
        <div class="style-list">
          <el-radio-group v-model="selectedIgnoreMode" class="style-radio-group">
            <div
              v-for="(mode, index) in ignoreModes"
              :key="mode.id"
              class="style-card"
              :class="{ 'is-selected': selectedIgnoreMode === mode.id }"
              :style="{ animationDelay: `${index * 0.1}s` }"
              @click="selectIgnoreMode(mode.id)"
            >
              <div class="style-card-header">
                <el-radio :value="mode.id" size="large">
                  <span class="style-name">{{ mode.name }}</span>
                </el-radio>
              </div>
              <p class="ignore-mode-description">{{ mode.description }}</p>

              <div class="example-box ignore-example-box">
                <div class="example-text ignore-example-text">
                  <p
                    v-for="(line, lineIndex) in ignoreExampleLines"
                    :key="`${mode.id}-${lineIndex}`"
                    class="ignore-example-line"
                    :class="{
                      'is-ignored': shouldIgnoreLine(lineIndex, mode.id),
                      'is-kept': !shouldIgnoreLine(lineIndex, mode.id),
                    }"
                  >
                    {{ line }}
                  </p>
                </div>
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
        <p>
          &copy; 2026 Kisechan |
          <a
            href="https://github.com/Kisechan/kashi-emojilize"
            target="_blank"
            rel="noopener noreferrer"
            >GitHub</a
          >
        </p>
        <p>Built with Vue3 / Vite / Element Plus</p>
      </div>
    </el-footer>

    <!-- 欢迎说明对话框 -->
    <el-dialog
      v-model="showWelcomeDialog"
      width="65%"
      :max-height="40"
      align-center
      class="welcome-dialog"
    >
      <div class="welcome-content">
        <section class="welcome-section">
          <h2>
            👏 欢迎使用歌词 Emoji 化小工具！
          </h2>
        </section>
        
        <section class="welcome-section">
          <h3 class="section-title">项目功能</h3>
          <ul class="feature-list">
            <li>为歌词等文本自动添加 Emoji</li>
            <li>支持多种生成风格：收敛版、加强版、对称版</li>
            <li>快速处理，实时预览增强效果</li>
            <li>由 DeepSeek LLM 驱动</li>
          </ul>
        </section>

        <section class="welcome-section">
          <h3 class="section-title">使用指南</h3>
          <ol class="guide-list">
            <li>在左侧输入框粘贴或输入歌词文本（最多 5000 字）</li>
            <li>点击「选择生成风格」按钮选择喜欢的风格</li>
            <li>点击「提交」</li>
            <li>等待处理完成，在右侧查看增强后的文本</li>
            <li>点击「复制」按钮复制到剪贴板</li>
          </ol>
        </section>

        <section class="welcome-section">
          <h3 class="section-title">关于项目</h3>
          <p class="about-text">
            本项目由 <a href="https://github.com/Kisechan"><strong>Kisechan</strong></a> 创建和维护。
            如果你觉得这个工具对你有帮助，欢迎<a href="https://github.com/Kisechan/kashi-emojilize">在 GitHub 仓库给个 Star 支持一下</a>～
          </p>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="showWelcomeDialog = false">
            我知道了！
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
