# Kashi Emojilize

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vue](https://img.shields.io/badge/Vue-3.5-green?logo=vue.js)](https://vuejs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

为 Vocaloid 歌词自动添加发癫 emoji 的小工具。

在线体验：*[https://kashi.kisechan.space](https://kashi.kisechan.space)*

## 输出示例

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

#### 配置 API 密钥

**Worker 后端**：
```bash
cd worker
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars，填入你的 DeepSeek API Key
echo "DEEPSEEK_API_KEY=sk-your-api-key" >> .dev.vars
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

## API

### DeepSeek API

本项目使用 [DeepSeek API](https://platform.deepseek.com/) 进行文本增强处理，访问官网即可获取。

0.01 元的 API 大约可调用本项目的服务 20 次。

## 贡献

欢迎提交 Issue 和 Pull Request 来增强本项目！改进提示词、修复 Bug、添加新功能等都欢迎！

详细的贡献指南请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

- [提交 Issue](https://github.com/kisechan/kashi-emojilize/issues) - 报告 Bug 或提出建议
- [提交 PR](https://github.com/kisechan/kashi-emojilize/pulls) - 提交改动

## 许可

[MIT](./LICENSE).
