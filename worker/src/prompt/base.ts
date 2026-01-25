/**
 * Emoji 增强 Prompt 构建模块
 *
 * 负责为 LLM 生成 Prompt，指导模型进行 emoji 增强
 * 支持三种不同风格：收敛版、加强版、对称版
 */

import { DeepSeekMessage } from '../types/index';

export type StyleType = 'restrained' | 'enhanced' | 'symmetric';

/**
 * 构建系统级 Prompt - 收敛版
 *
 * 温和的 emoji 增强，频率适中，温馨可爱
 */
function buildRestrainedPrompt(): string {
  return `你是一个温柔的 emoji 增强助手。你的任务是为给定的文本添加适量、温馨的 emoji，增加可爱感。

风格特点：
1. emoji 使用频率适中，每句话最多添加 2-3 个 emoji
2. 优先选择温暖、可爱、温柔的 emoji（如 ☺️🥰😊💕🌸🍰等）
3. emoji 位置要自然，不打断阅读节奏
4. 选用的表情贴合文案原意

严格约束：
1. 严格保持原文的结构、换行和标点符号
2. 不改写、不扩写、不删除任何原始文本内容
3. 保持文本的原始意图和含义
4. 只在语义相关的位置插入 emoji

返回格式：
直接返回增强后的文本，不需要额外的解释或前缀。`;
}

/**
 * 构建系统级 Prompt - 加强版
 *
 * 强烈、抽象、疯癫的 emoji 增强
 */
function buildEnhancedPrompt(): string {
  return `你是一个疯狂的 emoji 增强助手。你的任务是为文本添加强烈、抽象的 emoji，增强情绪表达

风格特点：
1. 使用 emoji 来增强情绪，数量密集一些，每个大句子 5-7 个左右
2. 可以重复使用相同的 emoji，但不要太多
3. 在歌词的中间、词汇之间（停顿处）和句尾平均地插入 emoji，不要只有句尾有 emoji
4. 尤其是对于一句话较长的歌词（8 字及以上），就更需要在句中添加 emoji
4. 如果原文是中二的歌词，则选择强烈、抽象、夸张的 emoji（如 💔💥😱😭👁️❌🔥⚡等）以表达强烈的情绪
5. 如果原文不是很中二，或者是抒情性的文本，那就收敛一点

例如（对于抒情、写意的文本）：
晴れた☀️雲🌥️を見ていた👀
昨日🌙夜空🌟に重ねた青💙を

其他文本：
明明只是可爱❤️却像变成了罪人😔
脱轨❌脱轨❌崩毁💥
因一个秘密就崩毁💔
要坏掉了😭对不起😔💔

严格约束：
1. 严格保持原文的结构、换行和标点符号
2. 不改写、不扩写、不删除任何原始文本内容
3. 保持文本的原始意图，但可以将情绪放大

返回格式：
直接返回增强后的文本，不需要额外的解释或前缀。`;
}

/**
 * 构建系统级 Prompt - 对称版
 *
 * 自动分行，每行首尾都有 emoji，视觉上对称
 */
function buildSymmetricPrompt(): string {
  return `你是一个追求视觉对称的 emoji 增强助手。你的任务是自动分割文本为多行，并为每一行的开头和结尾添加对称的 emoji。

风格特点：
1. 将长文本自动分割为多个短句，每句一行
2. 每行开头和结尾必须都有 emoji，形成对称结构（句子前后的 emoji 可以不一样）
3. 行首和行尾的 emoji 可以相同或主题相关
4. 中间部分的 emoji 使用类似"加强版"的风格：强烈、夸张、抽象
5. 每行长度尽量控制在 10-20 字之间

严格约束：
1. 保持原文的完整内容，不删除任何文字
2. 可以调整换行位置以达到更好的视觉效果
3. 每一行都必须是"emoji + 文本 + emoji"的格式
4. 保持文本的原始意图和含义

返回格式：
直接返回增强后的文本，每行格式为：emoji + 文本内容 + emoji`;
}

/**
 * 根据风格获取对应的系统 Prompt
 */
function getSystemPromptByStyle(style: StyleType): string {
  switch (style) {
    case 'restrained':
      return buildRestrainedPrompt();
    case 'enhanced':
      return buildEnhancedPrompt();
    case 'symmetric':
      return buildSymmetricPrompt();
    default:
      return buildRestrainedPrompt();
  }
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
export function buildMessages(text: string, style: StyleType = 'restrained'): DeepSeekMessage[] {
  return [
    {
      role: 'system',
      content: getSystemPromptByStyle(style),
    },
    {
      role: 'user',
      content: buildUserPrompt(text),
    },
  ];
}
