# 高考英语真题练习 App

> 浙江高考英语真题刷题与模拟考试应用 · MVP

---

## 功能概览

| 功能 | 说明 |
|------|------|
| 🎯 真题模拟卷 | 30题·45分钟倒计时，完整模拟考试体验 |
| 📚 专项训练 | 按题型筛选，做完即时显示解析 |
| ❌ 错题本 | 自动保存错题，支持重新练习 |
| 📊 自动评分 | 提交后显示正确率、错题列表 |
| 🤖 AI 助理 | 占位页面，预留 Claude/OpenAI 接入接口 |
| 💾 本地存储 | 学习记录保存在 localStorage，无需登录 |

## 题库来源

- **2018–2025 年** 浙江高考英语真题（阅读理解为主）
- **87 道**有效单选题，全部含标准答案
- 题目标注：难度（基础/中等/进阶）、年份、题型

---

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开 http://localhost:5173
```

## 生产构建

```bash
npm run build
# 生成文件在 dist/ 目录，可直接用 Nginx/Caddy 等静态服务器托管
```

---

## 技术栈

- **React 18** + **TypeScript**
- **Tailwind CSS v3** — 极简设计系统
- **Vite** — 构建工具
- **lucide-react** — 图标
- **localStorage** — 本地持久化（无需数据库）

## 项目结构

```
src/
├── types/index.ts          # 核心数据类型
├── hooks/
│   ├── useLocalStorage.ts  # localStorage 封装
│   └── useProgress.ts      # 学习进度管理
├── utils/scoring.ts        # 评分 & 工具函数
├── components/
│   ├── QuestionCard.tsx    # 题目卡片
│   ├── OptionButton.tsx    # 选项按钮
│   ├── Timer.tsx           # 倒计时
│   └── ProgressBar.tsx     # 进度条
├── pages/
│   ├── Home.tsx            # 首页
│   ├── PracticeSetup.tsx   # 专项训练配置
│   ├── QuizSession.tsx     # 答题界面
│   ├── Results.tsx         # 成绩页
│   ├── WrongBook.tsx       # 错题本
│   └── AIAssistant.tsx     # AI 助理（占位）
└── App.tsx                 # 路由 & 状态管理

public/
└── questions.json          # 题库数据（87 道真题）
```

---

## 接入 AI 功能（下一步）

在 `src/services/ai.ts` 中实现以下函数即可：

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: 'your-key' });

export async function explainQuestion(question: Question): Promise<string> {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `请解析这道高考英语题：\n${question.question}\n正确答案：${question.answer}`
    }]
  });
  return (msg.content[0] as { text: string }).text;
}
```

然后在 `AIAssistant.tsx` 中调用即可。

---

## 重置学习记录

在浏览器控制台执行：

```javascript
localStorage.removeItem('gaokao_progress');
location.reload();
```
