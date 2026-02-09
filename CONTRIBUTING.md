# 贡献指南

**非常感谢你对 Kashi Emojilize 的兴趣**！这个文档会帮助你了解如何贡献代码、报告 Bug 或提出新的建议，让我们把这个项目变得更好。

## 报告 Bug

遇到问题？请帮助我们改进！请通过以下方式报告：

1. **检查现有 Issue**：在[提交新 Issue](https://github.com/kisechan/kashi-emojilize/issues) 前，先搜索是否已有相同的报告

2. **创建详细的 Bug 报告**，包括：
   - 问题描述
   - 操作系统和浏览器版本
   - 复现步骤
   - 实际行为 vs 预期行为
   - 错误日志或截图（如有）

## 建议改进

有好的想法？非常欢迎！

- 🎨 改进 UI/UX
- 📝 改进提示词效果
- ⚡ 性能优化
- 📚 文档改进

请在 [Issue](https://github.com/kisechan/kashi-emojilize/issues) 中讨论。

## 开发流程

### Fork 项目
点击仓库右上角的 `Fork` 按钮

### 克隆你的 Fork
```bash
git clone https://github.com/YOUR_USERNAME/kashi-emojilize.git
cd kashi-emojilize
```

### 添加上游仓库
```bash
git remote add upstream https://github.com/kisechan/kashi-emojilize.git
```

### 创建功能分支
```bash
git checkout -b feature/your-feature-name
# 或修复 Bug
git checkout -b fix/bug-description
```

### 本地开发
```bash
# 后端
cd worker
npm install
wrangler dev

# 前端
cd frontend
npm install
npm run dev
```

### 测试你的改动

- **后端测试**：
  ```bash
  cd worker
  npm test
  ```

- **测试 LLM 输出**：
  使用 `frontend/src/style-test.ts` 测试提示词效果

### 提交更改
```bash
git add .
git commit -m "feat: 添加新功能描述"
```

**提交信息规范**：
- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档修改
- `style:` - 代码格式（不影响功能）
- `refactor:` - 重构代码
- `test:` - 添加或修改测试

### Push 到你的 Fork
```bash
git push origin feature/your-feature-name
```

### 创建 Pull Request

1. 访问你的 Fork 仓库
2. 点击 `New Pull Request`
3. 选择目标分支为 `main`
4. 填写 PR 描述（参考下方模板）
5. 点击 `Create Pull Request`

**PR 描述模板**：
```markdown
## 描述
简要描述你的改动

## 相关 Issue
修复 #123

## 改动类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] Breaking change
- [ ] 文档更新

## 测试
描述你的测试方式

## 检查清单
- [ ] 代码遵循项目风格规范
- [ ] 自测通过
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
```

## 代码规范

### TypeScript
- 使用严格的 TypeScript 配置
- 为所有函数添加类型注解
- 避免使用 `any` 类型

### 代码风格
- 使用 Prettier 格式化
- 遵循 ESLint 规则
- 使用 4 个空格缩进

## 测试

提交 PR 前请确保：

- 能正常编译
- 本地开发模式下功能一切正常
- 没有 TypeScript 错误或警告

## 【特殊情况】提示词改进

如果你想改进 emoji 增强的效果，这是最欢迎的贡献！

1. **测试新提示词**：
   在 `worker/src/prompt/base.ts` 中修改提示词
   
2. **使用测试工具**：
   运行 `style-test.ts`

3. **提交 PR 时包括**：
   - 改进前后的示例输出
   - 改进的原因说明
   - 相关配置更改

## 许可证

通过提交 PR，你同意你的代码将以 MIT 许可证发布。

## 特别感谢

非常感谢所有为这个项目做出贡献的大家！你们的 Issue 报告、建议和代码改进让项目变得更好。

---

**Happy Contributing! 🎉**
