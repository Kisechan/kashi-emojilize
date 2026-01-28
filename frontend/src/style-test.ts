// 用于测试不同风格的文本增强效果
// 安装依赖，运行 `npm install`。
// 用以下命令运行脚本： 
//    `npx ts-node style-test.ts --api=<local|remote> --style=<restrained|enhanced>`

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

dotenv.config({ path: './.env.local' });

const STYLES = ['restrained', 'enhanced'];

const argv = yargs(hideBin(process.argv))
  .option('api', {
    alias: 'a',
    type: 'string',
    description: '选择 API 地址 (local 或 remote)',
    choices: ['local', 'remote'],
    default: 'local',
  })
  .option('style', {
    alias: 's',
    type: 'string',
    description: '选择要测试的风格 (restrained, enhanced)',
    choices: STYLES,
  })
  .help()
  .parseSync();

const API_URL = argv.api === 'remote' 
  ? 'http://kashi-emojilize-api.kisechan.space' 
  : 'http://localhost:8787';

async function enhanceText(text: string, style: string): Promise<{ text: string; duration: number }> {
  const url = `${API_URL}/enhance`;
  const startTime = Date.now();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, style }),
  });

  const duration = Date.now() - startTime;

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as { success: boolean; data?: string; error?: string };

  if (!data.success) {
    throw new Error(data.error || '增强失败');
  }

  return {
    text: data.data!,
    duration,
  };
}

async function runStyleTest() {
  const inputTexts = [
    `晴れた雲を見ていた\n昨日夜空に重ねた青を\n浅く影に隠れた\n君の描いた空が消えない\n忘れたら 君はいなくなるから\n揺らいだ昨日を思い出せ`,
    `知らない知らない僕は何も知らない\n叱られた後のやさしさも\n雨上がりの手の温もりも\nでも本当は本当は本当は本当に寒いんだ`
  ];

  for (const inputText of inputTexts) {
    console.log('开始测试以下文案：\n');
    console.log(inputText);
    console.log('\n====================\n');

    const stylesToTest = argv.style ? [argv.style] : STYLES;

    for (const style of stylesToTest) {
      try {
        console.log(`风格: ${style}`);
        const result = await enhanceText(inputText, style);
        console.log(`结果: \n${result.text}`);
        console.log(`耗时: ${result.duration}ms`);
        console.log('--------------------\n');
      } catch (error) {
        const err = error as Error;
        console.error(`风格 ${style} 测试失败:`, err.message);
      }
    }
  }
}

runStyleTest().catch((error: unknown) => {
  const err = error as Error;
  console.error('测试过程中发生错误:', err.message);
  process.exit(1);
});
