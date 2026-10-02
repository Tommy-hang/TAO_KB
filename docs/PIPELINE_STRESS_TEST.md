---
title: "Tao Knowledge Base — Four-Video Stress Test & Pipeline V1.1"
date: "2026-10-02"
type: "pipeline-validation"
status: "validated"
---

# Tao Knowledge Base — 第二轮四视频压力测试

> **目标：验证 Structured Long-form Knowledge Note 能否稳定处理不同类型的视频，而不依赖一个死模板。**

---

# 1. 测试样本

本轮使用四篇原生字幕：

| 样本 | 类型 | 时长 | 最主要的结构挑战 |
|---|---|---:|---|
| 人的身体、衣服是如何出卖心理的？ | 观察方法型 | ~28:43 | 大量“观察 → 推断”，容易把推断写成事实 |
| 餐厅服务员加重了我的精神内耗 | 自传叙事型 | ~35:48 | 知识藏在故事和人格变化中，不能压成观点列表 |
| 西方人根本不懂政治 | 政治观点型 | ~33:13 | 外部事实、价值判断、因果解释高度混合 |
| 为什么年轻人恋爱难？ | 咨询 → 社会分析型 | ~19:11 | 从个案跳到性别、现代性与社会制度，尺度不断变化 |

加上第一轮：

| 样本 | 类型 |
|---|---|
| 只要做好这些“数学题”，你就不会过不好这一生 | 公理体系型 |

五种内容全部可以使用同一套外层：

```text
30-Second Recall
3-Minute Overview
Full Knowledge Note
Key Takeaways
Questions
My Notes
Source
```

但 **Full Knowledge Note 的内部组织必须动态生成。**

这验证了：

> **外层统一，内层自由。**

---

# 2. V1 最大的问题：只检查“是否漏内容”还不够

第一轮重点解决：

```text
Completeness
Fidelity
Logic
Numbering
```

第二轮发现另一个风险更大：

> **Epistemic Laundering：把作者的判断在整理过程中洗成知识库自己的“事实”。**

例如源视频可能说：

```text
某种衣服
→ 某种人格
```

如果 AI 整理成：

> “某种衣服代表某种人格。”

那么只是少了“作者认为”三个字，知识性质已经完全改变。

政治、心理、性别、社会议题尤其危险。

所以 V1.1 增加：

# Claim Provenance Layer

---

# 3. Claim Provenance — 每个重要观点先判断它是什么

内部 Understanding Map 新增五类：

## A. Direct Observation

源材料直接可观察内容。

例如：

```text
人物在访谈中喝水。
作者在某家餐厅工作过。
```

---

## B. Personal Experience

作者对自己亲历事件的叙述。

例如：

```text
“我看到食品掉到地上后继续出售。”
```

它仍然只是作者的个人叙述，不自动等于我们对企业整体的事实判断。

---

## C. Author Inference

作者根据观察做出的推断。

例如：

```text
“他喝水说明现在非常紧张。”
```

知识库写：

> 作者把喝水与其他身体变化一起解释为紧张。

而不是：

> 喝水证明他紧张。

---

## D. External Factual Claim

涉及统计数字、历史事件、国家制度、科学、心理学、企业、政治人物等可被外部证据验证的内容。

默认：

```yaml
external_fact_check: false
```

时，只能：

> “视频声称……”

如果未来执行 Fact-check，再升级。

---

## E. Normative / Value Claim

例如：

```text
什么是好生活？
什么样的社会更好？
什么关系是正确的？
什么审美更高级？
```

这不是“真假问题”，而是作者的价值判断。

不能被 Verify 自动改写成事实。

---

# 4. Pipeline V1.1

新的完整流程：

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
PUBLISH
```

---

# 5. 新增 Stage 0.5 — Content Type Classification

开始写之前，先判断主结构。

目前至少识别五类。

## Type A｜System / Framework

例如：

《只要做好这些“数学题”……》

内部结构：

```text
Root
→ Principles
→ Derived Rules
→ Examples
→ Final Synthesis
```

---

## Type B｜Observation / Method

例如：

《人的身体、衣服是如何出卖心理的？》

内部结构：

```text
Cue
→ Hypothesis
→ Cross-check
→ Context
→ Pattern Library
```

---

## Type C｜Narrative / Autobiography

例如：

《餐厅服务员加重了我的精神内耗》

内部结构必须保留：

```text
State 1
→ Event
→ Adaptation
→ Escalation
→ Turning Point
→ State 2
→ Retrospective Interpretation
```

不能改写成：

```text
10 个职场道理
```

因为真正重要的是：

> 人怎么变了。

---

## Type D｜Argument / Public Affairs

例如：

《西方人根本不懂政治》

内部结构：

```text
Thesis
→ Analytical Model
→ Case A
→ Case B
→ Generalization
→ Practical Conclusion
```

同时必须启动：

```text
Political / Public-claim attribution mode
```

---

## Type E｜Case Consultation → General Theory

例如：

《为什么年轻人恋爱难？》

内部结构：

```text
Individual Question
→ Diagnostic Criterion
→ Psychological Model
→ Social Expansion
→ Return to Individual
```

关键是：

> 最后必须回到开头的咨询问题。

否则文章会“越写越大”，丢失原始问题。

---

# 6. 新增 Epistemic Verify

写完后问：

## Observation / Inference

- 有没有把观察写成心理事实？
- 有没有把“可能”改成“一定”？
- 有没有把单案例改成普遍规律？

## Science / Psychology

- 作者是否引用了理论？
- AI 是否偷偷帮作者补充了科学权威？
- 未核验内容有没有被写成“研究表明”？

## Politics / History

- 是否明确是作者观点？
- 有没有把争议因果写成确定事实？
- 有没有把某政治立场变成知识库自己的结论？

## Gender / Sexuality / Groups

- 有没有把强泛化写成客观分类？
- 有没有因为“忠于原文”而让知识库本身采用贬损标签？

原则：

> **Preserve the source's argument without inheriting the source's epistemic certainty.**

---

# 7. 叙事型视频新增“双时间轴”

《餐厅服务员》暴露了一个重要问题。

视频同时存在：

## Then-Self

```text
2010 年当时的涛哥
```

他看到什么、怎么做、怎么想。

## Later-Self

```text
多年后制作视频的涛哥
```

重新解释：

- 自己为什么装傻；
- 为什么精神内耗；
- 为什么突然离职；
- 人格面具意味着什么。

AI 如果把两者混在一起，就会制造假的“当时洞察”。

所以 Understanding Map 新增：

```text
Event Timeline
Interpretation Timeline
```

发布时可以自然融合，但不能改变时间关系。

---

# 8. 观察型视频新增 Evidence Ladder

《衣服与心理》说明，一类内容最容易出现：

```text
一个动作
→ 直接定人格
```

因此内部强制生成：

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

如果只有 Cue，没有 Cross-check：

```text
Confidence = Low
```

即使作者语气非常确定。

知识库不需要反驳作者。

只需要防止：

> 作者的确信程度 = 证据强度。

---

# 9. 政治类视频新增 Viewpoint Mode

对于政治 / 公共事务：

Front Matter：

```yaml
political_viewpoint_note: true
external_fact_check: false
```

文章顶部注明：

> 本文重建源视频观点，不代表事实核验或知识库政治立场。

正文优先使用：

```text
作者认为……
视频将……解释为……
作者用……作为案例……
```

禁止 AI 在结尾自动生成：

```text
所以我们应该……
因此正确的制度是……
```

除非明确写成：

> 作者最终主张……

这样可以完整保存源思想，同时不让知识库替作者背书。

---

# 10. Sensitive Claim Rule

涉及以下主题时自动启用：

```text
mental health
gender
sexual orientation
race / ethnicity
religion
politics
medical / biological causation
```

如果源视频做强因果推断：

```text
A
→ 必然导致
B
```

而没有源内证据链：

Knowledge Note 保留：

> 作者将 A 解释为 B 的原因。

不要写：

> A 会导致 B。

---

# 11. QA Gate V1.1

发布标准从六项升级为七项：

| Gate | 问题 |
|---|---|
| Completeness | 核心内容漏了吗？ |
| Fidelity | 原意歪了吗？ |
| Logic | 推导链还完整吗？ |
| Clarity | 比字幕清楚吗？ |
| Semantic Compression | 去噪但没削骨吗？ |
| Recall | 快速层能重建全文吗？ |
| Epistemic Attribution | 作者判断有没有被洗成事实？ |

只有全部 PASS：

```text
PUBLISHED
```

---

# 12. 这轮实验对知识库架构的意义

最开始我们可能会觉得：

> 建知识库最重要的是切片、标签、向量和搜索。

经过五篇真实字幕以后，结论完全不同。

真正困难的是：

```text
源材料
→ 忠实理解
→ 保住论证
→ 不改变知识性质
```

技术层反而相对简单。

因此整个 Tao Knowledge Base 应该继续坚持：

> **Structured Long-form Note is the canonical source.**

未来的：

```text
Embedding
RAG
Search
Section Retrieval
```

全部从文章动态派生。

不要过早维护第二套“观点数据库”。

---

# 13. V1.1 Master Prompt 新增段落

把下面内容加入原 Master Prompt：

```text
Before writing, classify every major claim internally as:

- Direct Observation
- Personal Experience
- Author Inference
- External Factual Claim
- Normative / Value Claim

Preserve the author's argument, but never silently upgrade:

observation → fact
inference → fact
anecdote → universal law
value judgment → objective truth

For sensitive or political claims, prefer explicit attribution:
“the author argues...”
“the video interprets...”
“the author uses X as an example...”

If external fact-checking was not requested, do not silently correct or validate the source.
Set external_fact_check: false.
```

---

# 14. Final Architecture After Five Experiments

```text
Raw Transcript
      ↓
Source Hygiene
      ↓
Content Type
      ↓
Understanding Map
      ↓
Claim Provenance Map
      ↓
Structured Long-form Note
      ↓
Coverage + Fidelity + Epistemic Verify
      ↓
Repair
      ↓
Publish
      ↓
Build-time Section Chunking
      ↓
Semantic Search / RAG
```

---

# 15. 当前判断

五种完全不同的视频已经验证：

```text
System
Observation
Narrative
Political Argument
Relationship / Social Analysis
```

都能够落到同一种长期知识资产：

> **完整、结构化、带快速复习层的 Markdown 长文。**

因此目前不需要增加：

- 独立 Knowledge Graph；
- 原子 Idea 库；
- 复杂双向链接系统。

真正值得继续完善的是：

1. Subtitle cleaning
2. Understanding Map
3. Claim Provenance
4. Coverage verification
5. Dynamic chapter generation
6. Retrieval / RAG（后做）

这意味着 V1.1 已经足够进入下一阶段：

> **把“人工提示词流程”逐步变成可批处理的 Knowledge Compiler。**
