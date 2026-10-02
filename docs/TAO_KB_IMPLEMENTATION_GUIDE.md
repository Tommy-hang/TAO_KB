---
title: "TAO Knowledge Base — Codex Implementation Guide"
version: "1.0"
date: "2026-10-02"
status: "Implementation Ready"
audience: "Codex / AI coding agents / future maintainers"
---

# TAO Knowledge Base
## Codex Implementation Guide V1.0

> **Preserve the Thought. Simplify the System.**
>
> 本文是 TAO Knowledge Base 的正式工程指导书。
>
> Codex 在开始写代码前，必须完整阅读本文。  
> 本文中的 **MUST / MUST NOT / SHOULD / MAY** 分别表示：
>
> - **MUST**：必须执行，不得自行改变。
> - **MUST NOT**：禁止执行。
> - **SHOULD**：默认执行，除非有明确技术理由。
> - **MAY**：可选能力，不属于 V1 必需范围。

---

# 0. 给 Codex 的第一条指令

不要把这个项目理解成：

- 一个博客模板；
- 一个 AI 聊天网站；
- 一个知识图谱；
- 一个字幕总结器；
- 一个 CMS；
- 一个复杂 SaaS。

它是：

> **一个把精选高质量视频整理成完整、清晰、可复习、可检索 Markdown 长文，并通过轻量静态网站长期保存的个人知识库。**

项目的核心价值不来自功能数量，而来自：

```text
Source Fidelity
×
Reading Quality
×
Recall Efficiency
×
Low Complexity
×
Long-term Maintainability
```

任何新功能，如果不能显著提升这五项之一，就不要加入。

---

# 1. 项目目标

## 1.1 核心目标

TAO Knowledge Base 解决四件事：

```text
发现一个值得长期保存的视频
↓
把原生字幕整理成高质量 Knowledge Note
↓
未来快速找到并重新理解
↓
通过 Topics / Collections 继续阅读相关内容
```

## 1.2 核心知识单位

V1 唯一的 Canonical Knowledge Unit：

> **Structured Long-form Knowledge Note**

规则：

```text
1 Video
=
1 Knowledge Note
```

Knowledge Note 必须尽量保留：

- 原视频完整问题；
- 原视频自身逻辑顺序；
- 核心论证链；
- 必要案例；
- 限定条件；
- 作者自己对体系结构的解释；
- 最终回扣。

不以“拆成尽可能多的观点”为目标。

---

# 2. V1 明确不做什么

以下内容 **MUST NOT** 出现在 V1：

- 独立 Idea Database
- Claim Database
- Knowledge Graph
- Graph View
- 复杂 Ontology
- CMS 后台
- 数据库
- 登录系统
- 用户账户
- 在线编辑器
- AI Chat
- RAG
- Vector Database
- 实时推荐系统
- 复杂个性化
- 社交功能
- 大型 UI Component Library
- Redux / Zustand 等全局状态库
- 微服务
- Docker 作为普通用户必需项
- 为未来“可能会用”而提前建立复杂抽象

原则：

> **未来能力通过干净的数据协议自然扩展，而不是今天提前实现。**

---

# 3. 设计宪法

所有开发决策必须遵守以下规则。

## 3.1 Document First

永久资产：

```text
Markdown Knowledge Note
```

不是：

```text
数据库中的碎片
```

未来 Search / Embedding / RAG 都从 Markdown 动态派生。

---

## 3.2 Preserve the Thought

AI 和代码的第一任务不是压缩最多，而是：

> **不破坏原视频完整思想结构。**

---

## 3.3 Semantic Compression

允许：

- 去口头禅；
- 去明显重复；
- 修复断句；
- 合并重复案例；
- 提高表达密度。

禁止：

- 为了短而删除推理前提；
- 删除限制条件；
- 删除承担论证作用的案例；
- 把复杂论证压成几条金句。

---

## 3.4 Outer Consistency, Inner Freedom

所有 Knowledge Note 使用一致的外层结构：

```text
30-Second Recall
3-Minute Overview
Full Knowledge Note
Key Takeaways
Questions Worth Thinking About
Source
```

但 `Full Knowledge Note` 的内部章节：

> **必须根据视频真实结构动态生成。**

---

## 3.5 Late Binding

机器需要的结构尽量：

```text
Build Time
or
Query Time
```

自动生成。

不要要求作者手工维护：

- paragraph IDs；
- atomic ideas；
- embeddings；
- relationship graph。

---

## 3.6 Complexity Budget

任何功能加入前必须回答：

```text
它解决什么真实问题？
用户会多久使用一次？
实现成本是多少？
维护成本是多少？
有没有更简单的实现？
```

如果收益不明显：

> 不实现。

---

# 4. 已验证的内容类型

经过真实字幕测试，当前至少存在五种内容结构。

Codex 不要为每一种建立独立产品。

它们共享一个 Knowledge Note 外壳，只在内部写作结构不同。

## Type A — System / Framework

典型结构：

```text
Root Principle
→ Principles
→ Derived Rules
→ Examples
→ Final Synthesis
```

适合公理体系、方法论体系视频。

---

## Type B — Observation / Method

典型结构：

```text
Cue
→ Hypothesis
→ Cross-check
→ Context
→ Pattern
```

适合“神之阅读”、行为观察类视频。

---

## Type C — Narrative / Autobiography

典型结构：

```text
Initial State
→ Event
→ Adaptation
→ Escalation
→ Turning Point
→ New State
→ Retrospective Interpretation
```

必须保留人物变化。

禁止把长故事粗暴转换成：

```text
10 个职场道理
```

---

## Type D — Argument / Public Affairs

典型结构：

```text
Thesis
→ Analytical Model
→ Cases
→ Generalization
→ Conclusion
```

需要额外的 Claim Attribution。

---

## Type E — Case Consultation → General Theory

典型结构：

```text
Individual Question
→ Diagnostic Criterion
→ Psychological / Social Model
→ Expansion
→ Return to Individual
```

最后必须回到最初问题。

---

# 5. 技术路线

## 5.1 V1 技术栈

正式选择：

```text
Astro
TypeScript
Markdown
Astro Content Collections
Tailwind CSS（轻量使用）
Pagefind
Node.js scripts
Git
GitHub Pages
GitHub Actions
```

### 为什么选择 Astro

TAO Knowledge Base 是内容型静态网站。

Astro 适合：

- Markdown First；
- 静态预渲染；
- 文件路由；
- 内容集合；
- Front Matter Schema；
- 少 JavaScript；
- GitHub Pages；
- 内容页面性能优秀。

官方文档：

https://docs.astro.build/en/guides/content-collections/

https://docs.astro.build/en/guides/deploy/github/

### 为什么不是重 React SPA

不是因为 React 不好。

而是这个项目：

```text
90% 阅读
10% 交互
```

如果整站做 SPA，会增加：

- hydration；
- client state；
- router；
- bundle；
- deep-link 部署处理；

却没有明显收益。

V1 SHOULD 使用 Astro Components + 少量原生 JS。

如果以后真的需要复杂交互，再局部加入 React island。

---

## 5.2 搜索：Pagefind

V1 MUST 使用 Pagefind 做全文搜索。

理由：

- 静态生成；
- 无服务端；
- Build 后创建索引；
- 不需要数据库；
- 支持中文文本分词；
- 与 GitHub Pages 兼容。

官方文档：

https://pagefind.app/docs/

https://pagefind.app/docs/multilingual/

HTML MUST 设置：

```html
<html lang="zh-CN">
```

---

# 6. 总体架构

```text
                     TAO Knowledge Base

┌────────────────────────────────────────────────────┐
│                   PRIVATE SOURCE                   │
│                                                    │
│  raw subtitle → clean transcript → AI workspace   │
└────────────────────────┬───────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────┐
│                KNOWLEDGE COMPILER                  │
│                                                    │
│  Understand                                        │
│  Claim Provenance                                  │
│  Write                                             │
│  Verify                                            │
│  Repair                                            │
└────────────────────────┬───────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────┐
│               CANONICAL KNOWLEDGE                  │
│                                                    │
│              Markdown Knowledge Notes              │
│                                                    │
│   Notes             Collections             Pages  │
└────────────────────────┬───────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────┐
│                  STATIC WEBSITE                    │
│                                                    │
│   Home  Library  Topics  Collections  Search       │
│                                                    │
│                     Astro                          │
└────────────────────────┬───────────────────────────┘
                         │
                         ▼
                 Pagefind + GitHub Pages
```

---

# 7. 仓库目录

Codex SHOULD 创建以下结构。

```text
tao-knowledge/
│
├─ src/
│  │
│  ├─ content/
│  │  ├─ notes/
│  │  │  ├─ BVxxxxxxxx.md
│  │  │  └─ ...
│  │  │
│  │  ├─ collections/
│  │  │  ├─ cognition.md
│  │  │  └─ ...
│  │  │
│  │  └─ pages/
│  │     ├─ start-here.md
│  │     ├─ about.md
│  │     └─ methodology.md
│  │
│  ├─ content.config.ts
│  │
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ library.astro
│  │  ├─ start-here.astro
│  │  ├─ search.astro
│  │  ├─ notes/
│  │  │  └─ [bvid].astro
│  │  ├─ topics/
│  │  │  └─ [topic].astro
│  │  └─ collections/
│  │     └─ [slug].astro
│  │
│  ├─ layouts/
│  │  ├─ BaseLayout.astro
│  │  └─ NoteLayout.astro
│  │
│  ├─ components/
│  │  ├─ SiteHeader.astro
│  │  ├─ SearchBox.astro
│  │  ├─ NoteCard.astro
│  │  ├─ TopicChip.astro
│  │  ├─ CollectionCard.astro
│  │  ├─ NoteMeta.astro
│  │  ├─ ReadingJump.astro
│  │  ├─ TableOfContents.astro
│  │  └─ RelatedNotes.astro
│  │
│  ├─ lib/
│  │  ├─ notes.ts
│  │  ├─ topics.ts
│  │  ├─ collections.ts
│  │  ├─ related.ts
│  │  └─ paths.ts
│  │
│  └─ styles/
│     └─ global.css
│
├─ workspace/                 # MUST gitignore
│  ├─ sources/
│  │  └─ <BVID>/
│  │     ├─ raw.txt
│  │     ├─ clean.md
│  │     └─ meta.json
│  │
│  └─ jobs/
│     └─ <BVID>/
│        ├─ state.json
│        ├─ understanding.json
│        ├─ provenance.json
│        ├─ coverage.json
│        ├─ verify.json
│        ├─ qa.md
│        └─ draft.md
│
├─ prompts/
│  ├─ system.md
│  ├─ understand.md
│  ├─ write.md
│  ├─ verify.md
│  └─ repair.md
│
├─ scripts/
│  └─ kb/
│     ├─ new.ts
│     ├─ clean.ts
│     ├─ compile.ts
│     ├─ validate.ts
│     ├─ publish.ts
│     ├─ parser.ts
│     ├─ provider.ts
│     └─ schemas.ts
│
├─ public/
│  ├─ favicon.svg
│  └─ images/
│
├─ .github/
│  └─ workflows/
│     └─ deploy.yml
│
├─ .env.example
├─ .gitignore
├─ astro.config.mjs
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

# 8. Source Layer

## 8.1 Raw Transcript

每个视频必须保留：

```text
workspace/sources/<BVID>/raw.txt
```

`raw.txt` MUST：

- 保持原样；
- 不覆盖；
- 不自动修复；
- 不提交到公开 Git 仓库。

它是最终追溯源。

---

## 8.2 Clean Transcript

```text
clean.md
```

只允许：

- 断句；
- 标点；
- 明显 ASR 错别字；
- 时间戳标准化；
- 合并被切断的句子。

MUST NOT：

- 重写思想；
- 删除作者不方便的观点；
- 补充外部事实；
- “帮作者说得更科学”。

---

## 8.3 Copyright Boundary

`workspace/` MUST 出现在 `.gitignore`。

公开仓库只保存：

- Knowledge Note；
- 原视频 URL；
- BVID；
- 元信息；
- 少量必要引用。

MUST NOT 默认公开完整原字幕。

---

# 9. Knowledge Note Front Matter

所有 Note MUST 使用统一 schema。

推荐：

```yaml
---
id: "tao-BVxxxxxxxx"
title: "视频标题"

source_author: "火光四射的涛哥"
source_type: "video"
source_bvid: "BVxxxxxxxx"
source_url: "https://www.bilibili.com/video/BVxxxxxxxx/"
source_date: "2026-06-01"

content_type: "framework"

topics:
  - 成长
  - 认知

tags:
  - 基本功
  - 思考能力

collections: []

status: "published"
featured: false

note_version: "1.0"

transcript_available: true
external_fact_check: false
claim_provenance_review: true
fidelity_review: "passed"

created_at: "2026-10-02"
updated_at: "2026-10-02"
---
```

---

## 9.1 `content_type`

Enum:

```text
framework
observation
narrative
public-affairs
case-analysis
other
```

它只用于：

- Compiler 选择 prompt strategy；
- QA；
- 未来分析。

MUST NOT 决定页面视觉模板。

---

## 9.2 `topics`

一级知识分类。

SHOULD：

```text
1–5 个
```

建议长期控制在约：

```text
8–15 个核心 Topic
```

例如：

```text
认知
成长
社会
人性
文化
教育
职场
关系
心理
人生
政治
历史
```

不要每篇文章创造新 Topic。

---

## 9.3 `tags`

用于具体关键词。

建议：

```text
3–12 个
```

Tags MAY 自然增长。

---

## 9.4 Collections

只填写 Collection slug：

```yaml
collections:
  - cognition
  - youth-growth
```

Collection 顺序由 Collection 文件决定。

---

# 10. Knowledge Note Body Contract

V1 MUST 使用以下一级逻辑。

注意：

Markdown 内不要再次写第二个页面 H1。

页面 H1 由 `NoteLayout` 使用 Front Matter `title` 渲染。

正文从编辑说明或 H2 开始。

推荐：

```markdown
> **编辑说明**
>
> ...

---

## 30-Second Recall

### 这期解决什么问题？

...

### 一句话核心

...

### 整体逻辑

```text
A → B → C
```

### 最值得记住的三件事

1.
2.
3.

---

## 3-Minute Overview

...

---

## Full Knowledge Note

### 01｜章节
...

### 02｜章节
...

---

## Key Takeaways

...

---

## Questions Worth Thinking About

...

---

## My Notes

...

---

## Source

...
```

---

# 11. 对 `My Notes` 的处理

注意：

如果站点仓库是 Public：

> `My Notes` 里的内容也会公开。

所以 V1：

- MAY 保留空的 `My Notes`；
- MUST NOT 自动把私人内容写进去；
- 用户需要公开个人思考时再手动填写。

未来如果需要真正 Private Notes：

> 单独设计本地 overlay。

V1 不做。

---

# 12. Collection 数据协议

Collection 是“阅读专题”，不是知识图谱。

文件示例：

```yaml
---
slug: "cognition"
title: "如何建立自己的判断体系"
summary: "围绕判断、经验、信息与思考能力的一组精选文章。"
status: "published"

notes:
  - "BVxxxxxx"
  - "BVyyyyyy"
  - "BVzzzzzz"
---
```

正文 MAY 写专题导读：

```markdown
## 为什么读这个专题？

...

## 推荐阅读顺序

...
```

---

# 13. Topic 不建立独立数据库

V1 Topic 页面：

> 从全部 Note Front Matter 自动聚合。

例如：

```text
/topics/认知/
```

自动展示所有：

```yaml
topics:
  - 认知
```

的文章。

不要手工维护 Topic JSON。

---

# 14. Knowledge Compiler V1.1

正式流程：

```text
SOURCE HYGIENE
      ↓
CONTENT TYPE CLASSIFICATION
      ↓
UNDERSTAND
      ↓
CLAIM PROVENANCE
      ↓
WRITE
      ↓
COVERAGE VERIFY
      ↓
FIDELITY VERIFY
      ↓
EPISTEMIC VERIFY
      ↓
REPAIR
      ↓
VERIFY AGAIN
      ↓
DRAFT
      ↓
HUMAN REVIEW
      ↓
PUBLISH
```

---

# 15. Stage 1 — Understand

MUST 先生成：

```text
understanding.json
```

禁止直接：

```text
raw transcript
→ final note
```

推荐 schema：

```json
{
  "coreQuestion": "",
  "coreThesis": "",
  "contentType": "",
  "nativeLogic": [],
  "chapters": [
    {
      "start": "00:00",
      "end": "05:20",
      "title": "",
      "purpose": "",
      "keyLogic": [],
      "structuralCases": [],
      "dependsOn": []
    }
  ],
  "mustPreserve": [],
  "structuralCases": [],
  "compressibleRepetition": [],
  "systemVocabulary": [],
  "asrUncertainties": [],
  "numberingIssues": [],
  "distortionRisks": []
}
```

Use Zod validation.

---

# 16. Claim Provenance

第二轮压力测试证明：

> 不能只检查“有没有漏”。

还要检查“知识性质有没有被改变”。

必须区分：

## A. Direct Observation

源视频直接描述的可观察内容。

## B. Personal Experience

作者个人经历叙述。

## C. Author Inference

作者基于观察的解释或推断。

## D. External Factual Claim

历史、政治、统计、科学、企业、人物等可被外部核验的事实声称。

## E. Normative / Value Claim

“应该怎样”“什么更好”等价值判断。

内部输出：

```text
provenance.json
```

推荐结构：

```json
{
  "claims": [
    {
      "summary": "",
      "type": "author-inference",
      "sourceRange": "05:00-06:20",
      "requiresAttribution": true,
      "externalFactCheck": false
    }
  ]
}
```

---

# 17. Epistemic Rule

Compiler MUST 遵守：

> **Preserve the source's argument without inheriting the source's epistemic certainty.**

禁止自动发生：

```text
Observation
→ Fact

Inference
→ Fact

Anecdote
→ Universal Law

Value Judgment
→ Objective Truth
```

如果作者说：

```text
我认为 A 说明 B
```

Knowledge Note SHOULD 写：

> 作者将 A 解释为 B。

不要写：

> A 证明了 B。

---

# 18. Sensitive Claim Mode

以下领域自动触发 attribution mode：

```text
politics
mental health
medical / biological causation
gender
sexual orientation
race / ethnicity
religion
crime
```

对于政治 / 公共事务：

Front Matter：

```yaml
political_viewpoint_note: true
external_fact_check: false
```

文章必须明确：

> 本文重建源视频观点，不代表事实核验或知识库政治立场。

---

# 19. Narrative Double Timeline

对于：

```text
content_type: narrative
```

Understanding MUST 同时生成：

```text
Event Timeline
Interpretation Timeline
```

原因：

```text
当时发生了什么
≠
多年以后作者如何解释它
```

禁止制造：

> 作者“当时就已经知道”的假洞察。

---

# 20. Observation Evidence Ladder

对于：

```text
content_type: observation
```

内部使用：

```text
Observed Cue
↓
Author Hypothesis
↓
Cross-check Evidence
↓
Context
↓
Confidence
```

Confidence 是：

> 源内证据支持度。

不是：

> 真理概率。

---

# 21. Write Stage

Write 输入：

```text
clean transcript
+
understanding.json
+
provenance.json
```

输出：

```text
draft.md
```

写作目标：

```text
Logic Preservation ≈ maximum
Noise ↓
Information Density ↑
Readability ↑
```

禁止追求固定压缩率。

---

# 22. Verify Stage

必须生成：

```text
coverage.json
verify.json
qa.md
```

---

## 22.1 Coverage

每个重要时间段映射到 Note。

例如：

```json
{
  "00:00-05:00": "Full Note / Section 1",
  "05:00-11:00": "Full Note / Section 2"
}
```

如果：

```text
source range → NONE
```

必须给理由。

合法：

```text
exact-repetition
oral-noise
nonessential-joke
redundant-example
```

非法：

```text
not important
too long
```

---

## 22.2 Fidelity

检查：

- 是否新增作者没表达的结论；
- 是否改变结论强度；
- 是否删掉限制条件；
- 是否把案例变成证明；
- 是否改变推导顺序；
- 是否过度美化原始逻辑。

---

## 22.3 Numbering

Framework 视频检查：

- 公理数量；
- 定理数量；
- 步骤；
- 阶段；
- 编号；
- 视频中途新增内容。

---

## 22.4 Epistemic Verify

检查：

- 推断是否被改成事实；
- 争议观点是否带 attribution；
- 政治观点是否被知识库背书；
- 敏感群体泛化是否被 AI 自己继续强化。

---

# 23. Repair

Verify 未 PASS：

```text
draft
↓
repair prompt
↓
new draft
↓
verify again
```

最多自动 Repair 两轮。

仍失败：

```text
needs-human-review
```

禁止无限循环。

---

# 24. Publish Gate

七项：

```text
Completeness
Fidelity
Logic
Clarity
Semantic Compression
Recall
Epistemic Attribution
```

必须全部：

```text
PASS
```

才允许 `status: published`。

---

# 25. Long Transcript Strategy

不要一开始就把任何字幕切成大量 chunk。

优先：

```text
whole transcript
```

因为全局结构最重要。

只有超过 Provider 安全上下文时再使用：

```text
Hierarchical Reading
```

流程：

```text
Transcript
↓
large semantic chunks
↓
Segment Understanding
↓
Global Understanding Merge
↓
Full Write
↓
Global Verify
```

Chunk MUST：

- 在时间戳 / 自然段边界切；
- 有小幅 overlap；
- 保留原始顺序；
- 每个 chunk 保存 time range。

禁止随机固定 token 切片后直接分别写文章。

---

# 26. LLM Provider Design

V1 SHOULD 使用：

> OpenAI-compatible provider abstraction

不要把整个 compiler 锁死某一家 API。

Environment：

```env
KB_LLM_API_KEY=
KB_LLM_BASE_URL=
KB_LLM_MODEL=
```

`provider.ts` 暴露简单接口：

```ts
interface LLMProvider {
  generate(input: {
    system: string
    prompt: string
    temperature?: number
  }): Promise<string>
}
```

MUST NOT：

- 把 API Key 写进仓库；
- 把模型名称硬编码在 prompt；
- 让 UI 依赖 LLM Provider。

---

# 27. Manual Mode 必须存在

知识站不能因为没有 API Key 就不能使用。

如果没有 Provider：

`npm run new` SHOULD：

```text
1. 导入字幕
2. 保存 source
3. 生成 prompt package
4. 告诉用户把结果放到指定文件
```

例如：

```text
workspace/jobs/BVID/manual/
  01-understand-prompt.md
  02-write-prompt.md
  03-verify-prompt.md
```

这样用户仍然可以：

> 在 ChatGPT 中运行流程，再把结果导入。

API 自动化只是加速层。

不是知识库存在的前提。

---

# 28. 人类只需要记住三个命令

保持 MiniBlog 式 Author Workflow。

## Command 1

```bash
npm run new -- path/to/subtitle.txt
```

目标：

```text
导入字幕
↓
创建 workspace
↓
解析 metadata
↓
运行 compiler（若配置 API）
或生成 manual prompt pack
↓
输出 draft
```

---

## Command 2

```bash
npm run dev
```

本地阅读知识站。

---

## Command 3

```bash
npm run publish -- BVxxxxxxxx
```

必须执行：

```text
validate draft
↓
verify QA PASS
↓
copy to src/content/notes/
↓
run Astro build
↓
run Pagefind
↓
git add
↓
generated commit
↓
git push
```

如果 build / QA 失败：

> MUST NOT push。

---

# 29. Expert Commands

Codex MAY 同时提供：

```bash
npm run kb:validate -- BVxxxx
npm run kb:verify -- BVxxxx
npm run kb:compile -- BVxxxx
npm run kb:clean -- BVxxxx
```

但 README 首页：

> 只强调三个普通命令。

---

# 30. Homepage IA

首页必须克制。

推荐：

```text
TAO KNOWLEDGE

Curated knowledge from selected videos.

[ Search ]

Start Here

Topics

Collections

Featured Notes

Latest Added
```

不要：

- Hero 大图；
- 炫酷粒子；
- 3D；
- 霓虹；
- 复杂动画；
- 自动播放视频；
- Dashboard 感。

---

# 31. Library

`/library/`

展示全部 Published Note。

功能：

- 按 source date 排序；
- Topic filter；
- Tag filter；
- keyword search entry；
- featured 标记。

不要做复杂 multi-filter query builder。

---

# 32. Note Page

URL：

```text
/notes/<BVID>/
```

BVID 是稳定 ID。

这样：

- 改标题不破坏 URL；
- 不需要手工维护 slug；
- 避免中文 URL 问题。

页面：

```text
Title

Metadata
Topic / Tags
Source Date
Original Video

[30s] [3min] [Full]
（V1 只是锚点 jump，不做复杂 Tab）

--------------------------------

30-Second Recall

3-Minute Overview

Full Knowledge Note

Key Takeaways

Questions Worth Thinking About

Related Notes

Source
```

---

# 33. ReadingJump

V1 不做动态模式切换。

按钮：

```text
30s
3min
Full
```

只做：

```text
scroll-to-section
```

原因：

- 实现极简单；
- 可访问性好；
- URL anchor 可分享；
- 不隐藏全文；
- 搜索索引完整。

未来真的有需求再加 Tab。

---

# 34. Table of Contents

Desktop：

右侧 MAY 有轻量 sticky TOC。

Mobile：

不显示侧栏。

TOC 只读取：

```text
Full Knowledge Note
```

内部 `###` 标题。

不要把：

- Recall；
- Overview；
- Key Takeaways；

全部塞进长 TOC。

---

# 35. Search UX

搜索框 placeholder：

> 搜索一个问题、概念、观点或视频……

Pagefind index SHOULD 包括：

- title；
- Recall；
- Overview；
- Full Note；
- topics；
- tags。

Search Result：

```text
Title

matching excerpt...

Topic · Tag · source date
```

Pagefind SHOULD 忽略：

- navigation；
- footer；
- source boilerplate；
- empty My Notes。

---

# 36. Related Notes

V1 不用 Embedding。

Build-time 简单打分：

```text
same collection +4
shared topic     +3 each
shared tag       +1 each
```

排除自己。

Top 3。

如果得分为 0：

> 不显示 Related Notes。

不要为了“页面看起来丰富”强行推荐。

---

# 37. Start Here

`/start-here/`

人工维护。

推荐只放：

```text
第一次了解涛哥
最值得反复看的内容
认知与判断
年轻人成长
社会观察
```

Start Here 是编辑入口。

不是算法推荐。

---

# 38. Design System

目标：

> **安静、克制、阅读优先、长期耐看。**

禁止：

- 俗赛博；
- neon；
- glassmorphism；
- 复杂渐变；
- 过度圆角；
- 大面积阴影；
- Dashboard card wall；
- 花哨 hover；
- 持续动画。

---

## 38.1 Color

建议基础：

```css
--bg: #f7f6f2;
--surface: #ffffff;
--text: #1c1c1a;
--muted: #77746d;
--border: #dedbd3;
--accent: #5f665a;
```

Codex MAY 微调。

MUST：

- 高对比度；
- 不使用多 accent；
- 不使用高饱和色作为主视觉。

---

## 38.2 Typography

优先系统字体。

UI：

```css
system-ui,
-apple-system,
BlinkMacSystemFont,
"Segoe UI",
"PingFang SC",
"Microsoft YaHei",
sans-serif
```

Body 最大宽度建议：

```text
720–780px
```

正文：

```text
line-height ≈ 1.8
```

中文长文 MUST 有足够行距和段间距。

---

## 38.3 Spacing

使用统一 scale：

```text
4
8
12
16
24
32
48
64
96
```

不要每个组件随意创建 margin。

---

# 39. Mobile First

必须保证：

- 375px 宽度可读；
- 不横向滚动；
- code block 可横向滚；
- 搜索可操作；
- tags 自动换行；
- table 有 overflow；
- 触控目标 ≥ 40px。

---

# 40. Performance

V1 MUST：

- 静态 HTML；
- 图片 lazy load；
- 不发送不必要 JS；
- 无大型 UI framework；
- 不加载视频 iframe，除非用户点击；
- 默认只提供原视频链接。

如果以后嵌 Bilibili：

> click-to-load。

不要页面打开就加载第三方 player。

---

# 41. Accessibility

MUST：

- semantic HTML；
- heading 层级正确；
- keyboard navigation；
- visible focus；
- aria-label for icon buttons；
- color 不作为唯一信息来源；
- prefers-reduced-motion；
- link 可辨识。

---

# 42. Content Collection Schema

Codex MUST 使用 Astro Content Collection schema。

建议使用 Zod。

约束：

```text
id unique
source_bvid unique
title non-empty
topics >= 1
tags >= 1
status enum
content_type enum
source_url valid URL
source_date date
```

Build 时任何 schema error：

> fail build。

---

# 43. Markdown Validation

`scripts/kb/validate.ts` 额外检查：

必须存在且只出现一次：

```text
## 30-Second Recall
## 3-Minute Overview
## Full Knowledge Note
## Key Takeaways
## Questions Worth Thinking About
## Source
```

检查：

- Full Note 至少 2 个三级章节；
- Recall 不为空；
- Overview 不为空；
- Source BVID 与 Front Matter 一致；
- 不允许重复 ID；
- published Note 必须 fidelity_review = passed。

---

# 44. Content Migration

现有实验 Knowledge Note 可能使用：

```text
# Full Knowledge Note
# 01 ...
```

Codex 在导入时可以写 migration script：

```text
H1 section
→ H2 main section
→ H3 internal chapter
```

MUST：

> 只改变 Markdown 层级。

MUST NOT：

> 改写现有文章内容。

---

# 45. Search Build

`package.json`：

SHOULD 类似：

```json
{
  "scripts": {
    "dev": "astro dev",
    "build:site": "astro build",
    "build:search": "pagefind --site dist",
    "build": "npm run build:site && npm run build:search"
  }
}
```

实际 package syntax 由 Codex 根据安装方式完成。

Search 在 `astro dev` 中如果 Pagefind index 不存在：

> 可以显示简短提示。

不要为了 dev search 再做第二套复杂搜索引擎。

使用：

```bash
npm run build
```

验证真实搜索。

---

# 46. GitHub Pages

使用 Astro 官方 GitHub Pages deployment。

Codex MUST：

- 正确设置 `site`；
- 正确设置 `base`；
- 使用官方 Actions 推荐流程；
- 支持 `<username>.github.io/<repo>/` 子路径；
- 所有内部链接 MUST 尊重 base path。

不要手写容易出错的绝对 `/` URL。

---

# 47. Testing

V1 至少需要：

## Unit

- Front Matter schema；
- BVID parser；
- timestamp parser；
- related score；
- required-section validator。

## Fixture

至少使用 5 个真实样本类型：

```text
framework
observation
narrative
public-affairs
case-analysis
```

## Build Test

CI：

```text
npm ci
npm run validate
npm run build
```

全部 PASS 才 deploy。

---

# 48. Error Handling

CLI 错误必须：

```text
告诉用户哪里错
告诉用户怎么修
```

不要：

```text
Error 1
undefined
ENOENT
```

直接扔给非开发者。

例如：

```text
❌ 找不到 BVID。
请确认字幕文件 Front Matter 中包含：
bvid: "BV..."
```

---

# 49. State Machine

Compiler job：

```text
imported
cleaned
understood
provenance-ready
drafted
verified
needs-repair
ready-for-review
published
failed
```

保存：

```text
workspace/jobs/<BVID>/state.json
```

这样任务中断后可以恢复。

---

# 50. Idempotency

以下命令必须尽可能可重复执行：

```bash
npm run new -- file
npm run kb:compile -- BVID
npm run kb:validate -- BVID
```

如果同一 BVID 已存在：

> 不要覆盖 raw source。

应提示：

```text
Source already exists.

[resume]
[recompile]
[cancel]
```

CLI 第一版不需要复杂交互 UI。

可以使用 flags：

```text
--resume
--force
```

但 `--force` MUST NOT 覆盖 `raw.txt`。

---

# 51. Security

MUST：

```text
.env*
workspace/
```

gitignore。

MUST NOT：

- commit API key；
- log full key；
- inject untrusted transcript into shell；
- execute source text；
- interpolate user file into command string。

File operations 使用 Node fs API。

---

# 52. Prompt Files

Prompt MUST 放在：

```text
/prompts
```

不要写死在 TS 源码里。

这样未来可以：

- 独立迭代 Prompt；
- Git diff；
- A/B；
- 不改 compiler。

---

# 53. Prompt Contract

## system.md

包含：

```text
Preserve the Thought
Semantic Compression
Document First
Epistemic Attribution
```

## understand.md

输出：

```text
understanding.json
```

## write.md

输入：

```text
understanding + provenance + transcript
```

输出：

```text
draft.md
```

## verify.md

输出：

```text
coverage + QA
```

## repair.md

只修改 Verify 指出的缺陷。

不要在 Repair 阶段“顺手重新写整篇”。

---

# 54. AI Output Validation

任何 AI 输出：

> 先 parse，再进入下一阶段。

如果要求 JSON：

- MUST parse；
- MUST Zod validate；
- 失败后只重试格式修复；
- 不 silently accept malformed output。

---

# 55. Logging

CLI 日志保持简洁：

```text
✓ source imported
✓ transcript cleaned
✓ understanding map generated
✓ provenance map generated
✓ draft generated
✓ coverage passed
✓ fidelity passed
✓ epistemic attribution passed

Draft:
workspace/jobs/BV.../draft.md
```

不要打印完整 Prompt / Transcript。

可提供：

```text
--verbose
```

给开发调试。

---

# 56. README

README 开头不要写一堆技术。

第一屏：

```text
# TAO Knowledge Base

Preserve the thought. Simplify the system.

## You only need three commands

npm run new -- <subtitle>
npm run dev
npm run publish -- <BVID>
```

然后再解释：

- 项目是什么；
- 内容目录；
- 添加文章；
- Deploy；
- Advanced。

---

# 57. Implementation Order

Codex MUST 按顺序实施。

不要一次生成全部然后声称完成。

---

## Phase 0 — Scaffold

完成：

- Astro；
- TypeScript；
- Tailwind；
- basic layout；
- content collections；
- GitHub Pages config。

验收：

```text
npm run dev
npm run build
```

PASS。

---

## Phase 1 — Knowledge Site

完成：

- Home；
- Library；
- Note；
- Topic；
- Collection；
- Start Here；
- Related Notes；
- design system。

导入 5 篇 validated sample Note。

验收：

- 所有 Note 可打开；
- 手机端可读；
- Topic 正确聚合；
- Collection 可排序。

---

## Phase 2 — Search

接 Pagefind。

验收：

搜索：

```text
成长
判断
恋爱
利益
衣服
```

能找到合理结果。

---

## Phase 3 — Content Validation

实现：

- Zod Front Matter；
- Markdown section validation；
- duplicate BVID；
- source URL；
- build fail。

---

## Phase 4 — Source Importer

实现：

```bash
npm run new -- path.txt
```

解析：

- title；
- URL；
- BVID；
- author；
- upload date；
- subtitle text。

保存 raw。

---

## Phase 5 — Compiler Manual Mode

先不接 API。

生成：

```text
prompt package
```

允许用户把 ChatGPT 生成的：

```text
understanding.json
draft.md
verify.json
```

放回 workspace。

然后：

```text
npm run kb:validate
```

---

## Phase 6 — LLM API Mode

只有前五阶段稳定后再接。

实现 Provider abstraction。

不要改变上层知识结构。

---

## Phase 7 — Publish Workflow

实现：

```bash
npm run publish -- BVID
```

严格：

```text
QA
→ build
→ Pagefind
→ git commit
→ push
```

---

# 58. V1 Acceptance Criteria

全部满足才称：

> **TAO Knowledge Base V1.0**

---

## Content

- [ ] 5 篇实验 Note 成功导入
- [ ] Markdown 是唯一公开知识真源
- [ ] Schema validation 有效
- [ ] Topics 自动生成
- [ ] Collections 人工维护

## Reading

- [ ] 首页简洁
- [ ] 30s / 3min / Full 快速跳转
- [ ] 正文中文排版舒适
- [ ] Mobile 正常
- [ ] TOC 正常
- [ ] 原视频可追溯

## Search

- [ ] 中文全文搜索
- [ ] excerpt 正常
- [ ] 不索引导航噪音

## Compiler

- [ ] raw source immutable
- [ ] understanding artifact
- [ ] provenance artifact
- [ ] coverage artifact
- [ ] QA gate
- [ ] failed QA 禁止 publish

## Engineering

- [ ] no database
- [ ] no backend
- [ ] no heavy UI library
- [ ] no secret committed
- [ ] GitHub Actions deploy
- [ ] production build PASS

---

# 59. Codex 必须做的最终检查

完成代码后，不要只说：

> “实现完成。”

必须实际运行：

```bash
npm install
npm run validate
npm run build
```

如果存在 tests：

```bash
npm test
```

然后检查：

- 首页；
- Library；
- 一篇 Note；
- Topic；
- Collection；
- Search；
- mobile layout；
- GitHub Pages base path。

如果工具允许浏览器预览：

> 实际打开页面。

---

# 60. Codex 最终报告格式

只需要：

```text
## Implemented

...

## Architecture

...

## Commands

npm run new
npm run dev
npm run publish

## Validation

npm run validate: PASS
npm run build: PASS
tests: PASS

## Known limitations

...

## Next recommended step

...
```

不要输出 200 行文件变更流水账。

---

# 61. Strict No-Go List

Codex MUST NOT：

1. 把项目重构成 Next.js 全栈应用；
2. 引入数据库；
3. 加 CMS；
4. 加账号；
5. 加知识图谱；
6. 加 AI Chat；
7. 为了“现代感”加大量动画；
8. 自动公开完整字幕；
9. 将 Workspace 提交到 Git；
10. 把 API Key 写进代码；
11. 删除来源追踪字段；
12. 把 Note 拆成大量 atom 文件；
13. 自动把所有 tag 都升级成 topic；
14. 自动生成几十个 collection；
15. 更改 5 篇实验文章的思想内容；
16. 未验证 build 就 push；
17. 因为某个第三方库方便，就让核心 Markdown 数据依赖它；
18. 创造一个用户不需要理解的巨大 abstraction layer。

---

# 62. Future Roadmap

只有 V1 稳定后考虑。

## V1.1

```text
Better compiler
Batch import
Review Date
Rediscover old note
More collections
```

## V1.5

```text
Semantic related notes
Optional embedding
Better question search
```

## V2

如果真实需求出现：

```text
RAG
Knowledge-grounded QA
```

要求回答必须返回：

```text
Note
Section
Source Video
Timestamp
```

## V3

只有当用户真实需要研究跨文章观点关系时，才考虑：

```text
Idea
Relation
Graph
```

不是默认终点。

---

# 63. 最终产品判断标准

这个项目成功，不是因为它拥有：

```text
100 个功能
```

而是因为用户可以做到：

```text
10 秒
知道网站是干什么的

30 秒
恢复一篇文章的核心记忆

3 分钟
重新加载论证框架

15–30 分钟
完整重新学习一篇视频

5 秒
找到模糊记得的观点

几个月后
依然愿意重新打开
```

---

# 64. Final Architecture

```text
                    SELECTED VIDEO
                          │
                          ▼
                     RAW SOURCE
                          │
                          ▼
                    CLEAN SOURCE
                          │
                          ▼
                   UNDERSTANDING
                          │
                          ▼
                 CLAIM PROVENANCE
                          │
                          ▼
                STRUCTURED LONG NOTE
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
     30s Recall       3min Overview      Full Note
          │               │                │
          └───────────────┴────────────────┘
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
              Topics            Collections
                │                   │
                └─────────┬─────────┘
                          ▼
                       Pagefind
                          │
                          ▼
                    Static Website
                          │
                          ▼
                    GitHub Pages
```

---

# 65. 项目的一句话定义

> **TAO Knowledge Base 是一个以完整结构化 Markdown 长文为核心，通过分层阅读提高复习效率，通过轻量 Topic / Collection / 全文搜索完成知识组织，并为未来 AI 检索保留干净接口的精选视频知识库。**

---

# 66. 项目最高原则

最后，Codex 在任何设计决策前都应该重新读这一句：

> **Preserve the thought. Simplify the system.**

如果某项设计：

```text
让系统更复杂
但没有让思想保存、阅读、检索、复习明显变好
```

不要做。

---

# Appendix A — 推荐的 package 范围

只安装真正必要依赖。

核心：

```text
astro
typescript
tailwindcss
pagefind
zod
gray-matter
tsx
```

根据 Astro 当前官方集成方式安装 Tailwind。

MAY：

```text
yaml
```

如果确实需要独立 YAML 解析。

MUST NOT 默认加入：

```text
React
Vue
Svelte
Redux
Zustand
Prisma
Supabase
Firebase
Algolia
Elasticsearch
```

---

# Appendix B — `.gitignore`

至少：

```gitignore
node_modules/
dist/
.astro/

.env
.env.*
!.env.example

workspace/
.DS_Store
```

---

# Appendix C — `.env.example`

```env
# Optional. Manual compiler mode works without these.

KB_LLM_API_KEY=
KB_LLM_BASE_URL=
KB_LLM_MODEL=
```

---

# Appendix D — 示例用户工作流

## 第一次

```bash
git clone ...
npm install
npm run dev
```

## 添加视频

```bash
npm run new -- "./subtitle.txt"
```

生成：

```text
workspace/jobs/BVxxxx/draft.md
```

阅读确认。

## 发布

```bash
npm run publish -- BVxxxx
```

结束。

---

# Appendix E — References

Astro Content Collections  
https://docs.astro.build/en/guides/content-collections/

Astro GitHub Pages Deployment  
https://docs.astro.build/en/guides/deploy/github/

Astro Markdown  
https://docs.astro.build/en/guides/markdown-content/

Pagefind  
https://pagefind.app/docs/

Pagefind Multilingual Search  
https://pagefind.app/docs/multilingual/

---

# End

This document is the implementation contract for TAO Knowledge Base V1.

Codex SHOULD preserve this file in the repository as:

```text
docs/TAO_KB_IMPLEMENTATION_GUIDE.md
```

Future architectural changes SHOULD update this document before changing foundational behavior.
