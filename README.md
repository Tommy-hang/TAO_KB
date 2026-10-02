# TAO Knowledge Base

Preserve the thought. Simplify the system.

一个把精选视频保存为完整 Markdown 长文的个人知识库。用 30 秒恢复记忆，用 3 分钟重建框架，也可以沿着完整论证慢慢读。

[GitHub 仓库](https://github.com/Tommy-hang/TAO_KB) · [字幕整理与发布工作指导](docs/PUBLISHING_WORKFLOW.md)

目前收录 **8 篇笔记、3 个阅读专题**。最新更新：2026-10-02，新增 4 篇完整字幕整理，涵盖思考能力、成长体系、人性与文明。仓库可见性保留为 private；GitHub Pages 是否启用及部署结果见下方发布状态，不把仓库上传等同于网站上线。

## You only need three commands

```sh
npm run new -- "./subtitle.txt"
npm run dev
npm run publish -- BVxxxxxxxxxx
```

首次使用先运行 `npm ci`。要求 Node.js 22.12+（建议 24）。`new` 默认生成手动编译提示词包；不会伪造未生成的草稿。`publish` 检查 QA 与编辑确认、构建搜索、提交指定笔记并推送。用户授权 Codex 整理并发布时，按[工作指导](docs/PUBLISHING_WORKFLOW.md)完成真实对照复核并记录代理身份，不冒充用户亲自审阅。

## 先打开网站

```sh
npm run dev
```

访问终端给出的本地地址。开发模式展示内容与样式；真实搜索使用生产索引：

```sh
npm run build
npm run preview
```

搜索“成长 / 判断 / 恋爱 / 利益 / 衣服”，或浏览主题与阅读专题。索引只收录已发布笔记，忽略导航、来源说明和空白个人笔记。

## 知识库内容

最初提供的 5 个资源是 **4 篇实验笔记与 1 份流程压力测试报告**。四篇原文已导入，正文仅调整 Markdown 标题层级并移除重复页面标题；迁移校验确保措辞不变。

原实验笔记已声明忠实度与观点归属审核通过，站点沿用这些标记；没有原字幕，不能声称重新对照字幕完成七项审核。新增笔记必须走完整 QA 流程。详情见 [内容迁移说明](docs/CONTENT_MIGRATION.md)。

2026-10-02 按用户提供的完整时间戳字幕新增：

| 视频 | BVID | 原发布日期 |
| --- | --- | --- |
| 巅峰神作 ︳最靠谱的逆天改命之法，我帮你找到了！ | BV1r2omB1EVY | 2026-04-25 |
| 只要做好这些“数学题”，你就不会过不好这一生 | BV1jXVZ6FEwq | 2026-06-01 |
| 理解这套“数学公式”，以后不要再说自己不懂人性了 | BV152T56XEUh | 2026-06-29 |
| 为何现代文明会让我们“没病找病”？ | BV1DXac6BEVA | 2026-09-24 |

“数学题”补齐真实框架型材料，并与另外三篇组成「从思考基本功，到人生与人性」专题。四篇以独立措辞重建完整推导，保留必要案例、编号问题和限定。代理完成字幕对照与观点归属复核；`external_fact_check: false`，不能将作者的医学、政治、命理或绝对命题写成已证实事实。

以后可以直接把字幕交给 Codex，并说“按工作指导整理、加入知识库、更新 README/About 并发布到 GitHub”。[AGENTS.md](AGENTS.md) 是代理工作入口，[PUBLISHING_WORKFLOW.md](docs/PUBLISHING_WORKFLOW.md) 覆盖从导入到云端验收的全过程。

## 内容放在哪里

| 目录 | 用途 |
| --- | --- |
| `src/content/notes/<BVID>.md` | 唯一公开知识真源 |
| `src/content/collections/` | 人工导读与有序阅读列表 |
| `src/content/pages/` | Start Here、关于、整理方法 |
| `workspace/sources/<BVID>/` | 原字幕、清理稿、元信息，Git 忽略 |
| `workspace/jobs/<BVID>/` | 理解、归属、覆盖、草稿、QA、任务状态，Git 忽略 |
| `prompts/` | 可独立迭代的编译提示词 |
| `docs/` | 总纲、压力测试、迁移说明与验收记录 |

Topics 从笔记自动聚合；Collections 的阅读顺序由专题文件维护。正文中的 My Notes 只有在手动填写后才展示，**填写的内容会随站点公开**。

## 添加一篇笔记

将字幕保存为 UTF-8 文本，头部提供元信息，正文保留时间戳：

```yaml
---
title: "原视频标题"
author: "火光四射的涛哥"
upload_date: "2026-06-01"
bvid: "BVxxxxxxxxxx"
---
[00:00] 字幕正文……
[00:25] 下一段……
```

此处 BVID 是格式示意，请填写真实 12 位标识。也支持字幕头部的 `标题：`、`作者：`、`发布日期：` 和 Bilibili 视频 URL。

运行 `new` 后，原文件字节以独占创建方式保存在 raw.txt。爬取导出的 `## 字幕` 前若有 iframe 和简介，派生清理稿会排除该包装；字幕本身只规范换行，不擅自修正 ASR。重复导入同一份源材料可使用 `--resume`；不同内容即使 `--force` 也不会覆盖原字幕。

### 默认手动模式

打开 `workspace/jobs/<BVID>/prompt-package/README.md`。将系统提示词、输入与 JSON schema 提供给自己的 AI 工具，按顺序生成：

1. `understanding.json`：问题、逻辑、章节、必要案例与风险。
2. `provenance.json`：区分观察、经验、推断、事实声称与价值判断。
3. `draft.md`：含统一 Front Matter 的完整笔记。
4. `coverage.json` 和 `verify.json`：覆盖映射与七项质量检查。

然后运行：

```sh
npm run kb:validate -- BVxxxxxxxxxx
npm run kb:verify -- BVxxxxxxxxxx
```

检查通过会生成 `qa.md` 与绑定产物指纹的 `gate.json`。阅读草稿与 QA 后，在交互终端执行 `publish` 并确认。已完成阅读的用户可添加 `--reviewed`；这个标志不是自动审核。用户明确委托代理整理发布时，可使用绑定草稿哈希、注明 `reviewerKind: agent` 和用户授权依据的本地 `review.json`；具体规范见工作指导。

### 可选 API 模式

复制 `.env.example` 为 `.env`，填写 OpenAI-compatible 服务的 API key、API base（通常以 `/v1` 结尾）和模型。然后：

```sh
npm run new -- "./subtitle.txt" --api
npm run kb:compile -- BVxxxxxxxxxx --api --resume
```

使用标准 `/chat/completions` 协议；模型需要支持该协议及 temperature 参数。系统不记录完整提示词、字幕或密钥。JSON 必须先解析与 Zod 校验，格式错误最多修复一次；质量失败最多修复两轮，之后交给人工。编译输出始终等待人工确认，不自动公开。

超过默认 100,000 字符安全上限的源材料不会截断。请使用手动模式先做分段理解与全局合并，再写全文；可依据真实模型上下文调整 `KB_LLM_MAX_CHARS`。V1 尚未自动实现超长字幕的分层合并。

## 发布

`publish` 的顺序是 QA → 人工确认 → 本地内容写入 → 内容校验 / 类型检查 / 静态构建 / Pagefind → 指定笔记 Git commit → push。QA 后源材料、草稿或审核产物有变化会阻止发布。构建失败恢复原有公开笔记；失败后请修复再重试。推送失败时本地提交保留，修复远程连接后执行 `git push`，不要重复生成内容。

本地试用可以运行：

```sh
npm run publish -- BVxxxxxxxxxx --local
```

更新已有公开笔记需要 `--replace`。`--dry-run` 只检查门禁并构建当前站点，不修改、提交或推送待发布草稿。不会顺带提交其他文件；暂存区已有修改时会阻止 Git 发布。

多篇与专题、README 同批更新时，可使用 `npm run publish:batch -- <BVID1> <BVID2> --local`。每篇先完成 QA 与绑定草稿的 `review.json`；发布器检查整批后同时写入、构建一次，失败恢复整批，成功后再统一提交有关文件。

目标仓库为 `Tommy-hang/TAO_KB`，分支 `main`，远程 `origin` 为上述 GitHub 地址。不要把 `workspace/`、完整字幕或 `.env` 加入 Git。HTTPS 证书故障应修复信任链或使用已授权的 GitHub 接口，不关闭 TLS 校验、不强推、不改变仓库可见性。

## GitHub Pages

在账户计划支持的前提下，在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**，再设置仓库 Actions 变量 `PAGES_ENABLED=true`。提交代码后，工作流先安装依赖、测试、验证、构建及检查内部链接，再上传静态产物并部署。未启用时继续运行内容与构建 CI，跳过部署。

私有仓库需要账户计划支持 Pages，见 [GitHub 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)。2026-10-02 启用请求返回 `422: Your current plan does not support GitHub Pages for this repository.`，因此本批保留 private，网站未上线。不能为了部署擅自把仓库改成 public。计划站点路径为 `https://Tommy-hang.github.io/TAO_KB/`，只有部署和访问都通过后才标记为已上线。

### 发布状态

本批发布状态将在上传和 Actions 验收后记录于 [本批验收记录](docs/RELEASE_2026-10-02.md)。完整字幕、提示词包和审核中间文件不会随仓库上传；公开文章保留来源并以独立措辞整理。

工作流自动从仓库地址计算 `SITE_URL` 和 `BASE_PATH`，支持 `/<repo>/` 子路径，也支持 `<owner>.github.io` 根站。自定义域名可修改这两项环境配置，配合仓库 Pages 域名设置。不要将本地默认 localhost 地址当作线上 canonical。

本地复验子路径（PowerShell）：

```powershell
$env:SITE_URL='https://example.github.io'
$env:BASE_PATH='/tao-kb/'
npm run build
npm run test:site
```

验证结束后清除这两个临时变量，再重新构建本地预览。

## Advanced / 维护

```sh
npm run validate        # schema、正文契约、重复 ID、专题引用
npm run check           # Astro / TypeScript
npm test                # parser、归属、覆盖、迁移、导入与发布门禁
npm run build           # 完整生产构建与中文索引
npm run test:site       # 产物页面、内部链接、锚点、搜索范围与 base
npm run kb:clean -- BVxxxxxxxxxx
npm run kb:compile -- BVxxxxxxxxxx
```

架构：Astro + TypeScript + Markdown Content Collections + 轻量 Tailwind/CSS + Pagefind + Node 脚本。静态 HTML，系统字体，只有筛选、搜索与目录需要少量 JavaScript。

编译器不是事实核验服务。机器门禁能够检查协议、覆盖映射与产物一致性，内容质量依赖真实比较与人工阅读；不能仅凭 AI 的 PASS 声称事实已得到验证。

实现依据：[项目总纲](docs/TAO_KB_IMPLEMENTATION_GUIDE.md)、[流程压力测试](docs/PIPELINE_STRESS_TEST.md)。工程参考：[Astro 内容集合](https://docs.astro.build/en/guides/content-collections/)、[GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)、[Pagefind](https://pagefind.app/docs/)。
