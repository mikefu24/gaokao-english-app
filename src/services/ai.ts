/**
 * AI service — wraps Anthropic SDK for browser usage.
 * API key is stored in localStorage by the user.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Question } from '../types';

// ─── Key management ──────────────────────────────────────────────────────────

const KEY_STORAGE = 'gaokao_anthropic_key';

export function getApiKey(): string {
  return localStorage.getItem(KEY_STORAGE) ?? '';
}

export function setApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem(KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(KEY_STORAGE);
  }
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

// ─── Client factory ──────────────────────────────────────────────────────────

function getClient(): Anthropic {
  const key = getApiKey();
  if (!key) throw new Error('请先在设置中填写 Anthropic API Key');
  return new Anthropic({
    apiKey: key,
    dangerouslyAllowBrowser: true, // intentional: personal-use tool, key stored locally
  });
}

// ─── AI explain question ─────────────────────────────────────────────────────

export async function explainQuestion(
  question: Question,
  userAnswer: string | null,
  onChunk: (text: string) => void
): Promise<void> {
  const client = getClient();

  const optionsText = Object.entries(question.options)
    .map(([k, v]) => `${k}. ${v}`)
    .join('\n');

  const userLine = userAnswer
    ? `学生选了 ${userAnswer}（${userAnswer === question.answer ? '正确 ✓' : '错误 ✗'}）`
    : '学生未作答';

  const prompt = `你是一位经验丰富的高考英语老师，请用中文详细讲解这道浙江高考英语题。

【题目】
${question.question}

【选项】
${optionsText}

【正确答案】${question.answer}
【${userLine}】
${question.year}年 浙江卷 · ${question.category_display}

请从以下角度解析：
1. 正确答案的理由（结合题干关键词）
2. 其他选项为什么不选（逐一简析）
3. 考点归纳（涉及的语言知识点或阅读技巧）
4. 解题技巧提示（1-2条实用方法）

语言要简洁清晰，重点突出，适合高中生阅读。`;

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      onChunk(chunk.delta.text);
    }
  }
}

// ─── AI essay scoring ────────────────────────────────────────────────────────

export async function scoreEssay(
  essay: string,
  promptText: string,
  onChunk: (text: string) => void
): Promise<void> {
  const client = getClient();

  const prompt = `你是一位专业的高考英语阅卷老师，请按照高考应用文评分标准（满分15分，五档评分法）对以下作文进行评分和点评。

【作文题目要求】
${promptText}

【学生作文】
${essay}

请按以下格式输出：

## 综合评分：X/15分（第X档）

## 各维度评价
- **任务完成度**：...
- **内容要点**：...
- **语法词汇**：...
- **篇章结构**：...
- **交际效果**：...

## 亮点
（列出2-3个写得好的地方）

## 主要问题
（列出2-3个需要改进的地方，给出具体修改建议）

## 参考表达
（给出1-2个可以替换的更地道的表达方式）

评语要具体、有建设性，帮助学生提高写作水平。`;

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      onChunk(chunk.delta.text);
    }
  }
}
