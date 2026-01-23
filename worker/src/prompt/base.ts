/**
 * Emoji 增强 Prompt 构建模块
 *
 * 负责为 LLM 生成 Prompt，指导模型进行 emoji 增强
 */

import { DeepSeekMessage } from '../types/index';

/**
 * 构建系统级 Prompt
 *
 * 定义模型的行为约束和目标
 */
export function buildSystemPrompt(): string {
  return `你是一个 emoji 增强助手。你的任务是为给定的文本添加语义相关的 emoji，以增强表现力。

约束条件：
1. 只在语义上相关的位置插入 emoji
2. 每处最多插入 1-2 个 emoji
3. 严格保持原文的结构、换行和标点符号
4. 不改写、不扩写、不删除任何原始文本内容
5. 保持文本的原始意图和含义
6. 如果文本中已有 emoji，请评估是否需要补充
7. 优先选择常见、易于理解的 emoji

返回格式：
直接返回增强后的文本，不需要额外的解释或前缀。`;
}

/**
 * 构建用户级 Prompt
 *
 * 包含待处理的具体文本
 */
export function buildUserPrompt(text: string): string {
  return `请为以下文本增强 emoji：

${text}`;
}

/**
 * 构建完整的消息列表
 *
 * 用于 DeepSeek API 调用
 */
export function buildMessages(text: string): DeepSeekMessage[] {
  return [
    {
      role: 'system',
      content: buildSystemPrompt(),
    },
    {
      role: 'user',
      content: buildUserPrompt(text),
    },
  ];
}
