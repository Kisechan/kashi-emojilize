# Kashi Emojilize

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vue](https://img.shields.io/badge/Vue-3.5-green?logo=vue.js)](https://vuejs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

为 Vocaloid 歌词自动添加发癫 emoji 的小工具。

在线体验：[https://kashi.kisechan.space](https://kashi.kisechan.space)

## 项目简介

**Kashi Emojilize** 是一款为 **Vocaloid 歌词等各类文案**自动插入 emoji 的工具。通过接入大语言模型 API 智能地将文本转换为充满 emoji 的版本，可以极大地增强内容的趣味性和视觉冲击力。

目前支持支持三种不同的风格：
- **收敛版**：温和可爱
- **加强版**（默认）：强烈抽象，密集使用 emoji，突出中二的风格
- **对称版**：视觉对称，每行开头结尾都有 emoji

如果对本项目的功能有更好的 idea，欢迎[贡献](#贡献)！

### 大致原理

1. **前端**：使用 Vue3 构建的 Web UI，用户输入歌词/文案并选择增强风格
2. **API 网关**：使用 Cloudflare Worker 接收前端请求，进行数据验证和转发
3. **LLM 处理**：使用 DeepSeek API，根据提示词对文本进行 emoji 增强处理

### 输出文本样例

> *花と水飴、最終電車* - n-buna/初音ミク
> 
> ```
> 晴れた☀️雲🌥️を見ていた👀
> 昨日🌙夜空🌟に重ねた青💙を
> 浅く🌫️影⚫に隠れた🚶‍♂️
> 君💔の描いた空🌌が消えない❌
> 忘れたら💭 君👤はいなくなるから🚪
> 揺らいだ🌀昨日📜を思い出せ🤔
> あの夏☀️にいつか🎁届いたのなら📬
> 昨日🌙に遠い🌠 遠い🌠花束💐
> ```
> 

## 快速开始

### 环境要求
- Node.js 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- [DeepSeek API Key](https://platform.deepseek.com/api_keys)

### 本地开发

#### 克隆项目

```bash
git clone https://github.com/kisechan/kashi-emojilize.git
cd kashi-emojilize
```

#### 配置环境变量

**后端**：
```bash
cd worker
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars，填入你的 DeepSeek API Key
echo "DEEPSEEK_API_KEY=sk-your-api-key" >> .dev.vars
```

**前端**：

```bash
cd worker
cp .env.example .env.local
# 编辑 .env.local，填入你的后端 API
```

#### 启动开发服务器

**后端**（在 `worker` 目录）：

```bash
npm install
wrangler dev
# 调用 http://localhost:8787
```

**前端**（在新终端，进入 `frontend` 目录）：

```bash
cd ../frontend
npm install
npm run dev
# 访问 http://localhost:5173
```

#### 使用测试脚本测试 LLM 输出效果

在本地使用 [`style-test.ts`](./frontend/src/style-test.ts) 可以方便地测试提示词。具体使用方法可以参考文件内部注释。

### 部署到生产环境

#### 部署 Cloudflare Worker

1. 登录 Cloudflare 账户
```bash
cd worker
wrangler login
```

2. 配置生产环境变量
```bash
# 设置 DeepSeek API Key 到 Cloudflare
wrangler secret put DEEPSEEK_API_KEY
# 输入 API key
```

3. 部署
```bash
wrangler deploy
```

#### 部署前端

根据你的托管服务部署 `frontend/dist` 目录。

```bash
cd frontend
npm run build
# 上传 dist 文件夹到你的托管服务
```

如果使用 Cloudflare 部署页面，则需要将 `.env.local` 中的环境变量同时填入托管服务。

#### 部署 Turnstile

**Cloudflare Turnstile** 是本项目的人机验证防线，防止自动化脚本滥用付费 API。以下是部署步骤：

1. **创建 Turnstile 小组件**
   - 打开 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 导航到 **Turnstile** 菜单
   - 点击 **Create Site**
   - 填写配置：
     ```
     Site Name: Kashi Emojilize
     主机名列表:
       - [生产域名，如 kashi.kisechan.space]
     Mode: Managed Challenge 
     ```

2. **获取密钥**
   - 创建完成后，复制 **Site Key** (公开，用于前端)
   - 复制 **Secret Key** (私密，用于后端)

3. **配置前端环境变量**

   **本地开发** (`frontend/.env.local`)：
   ```env
   VITE_TURNSTILE_SITE_KEY=...
   ```

   **Cloudflare Pages**：
   - Pages 项目 → Settings → Environment variables
   - 添加变量：
     ```
     VITE_TURNSTILE_SITE_KEY=...
     ```

4. **配置 Worker secrets**

   在 Worker 项目根目录执行：
   ```bash
   wrangler secret put TURNSTILE_SECRET_KEY
   # 粘贴 Secret Key 并回车
   ```

## API

### DeepSeek API

本项目使用 [DeepSeek API](https://platform.deepseek.com/) 进行文本增强处理，访问官网即可获取。

0.01 元的 API 大约可调用本项目的服务 20 次。

## 贡献

欢迎提交 Issue 和 Pull Request 来增强本项目！改进提示词、修复 Bug、添加新功能等都欢迎！

详细的贡献指南请查看 [`CONTRIBUTING.md`](CONTRIBUTING.md)

- [提交 Issue](https://github.com/kisechan/kashi-emojilize/issues) - 报告 Bug 或提出建议
- [提交 PR](https://github.com/kisechan/kashi-emojilize/pulls) - 提交改动

## 许可

[MIT](./LICENSE).
