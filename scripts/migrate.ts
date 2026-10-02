import fs from 'node:fs/promises';
import matter from 'gray-matter';
import { headings } from './kb/body';
const mapping: Record<
  string,
  { type: string; topics: string[]; collections: string[]; featured: boolean }
> = {
  BV1NM4m1f7HL: {
    type: 'observation',
    topics: ['认知', '心理', '人性'],
    collections: ['observation'],
    featured: true,
  },
  BV1nW421N7KA: {
    type: 'case-analysis',
    topics: ['关系', '心理', '社会'],
    collections: ['growth'],
    featured: true,
  },
  BV1oV4y1p7rH: {
    type: 'narrative',
    topics: ['成长', '职场', '人性'],
    collections: ['growth', 'observation'],
    featured: false,
  },
  BV1Z8mdY2Erj: {
    type: 'public-affairs',
    topics: ['政治', '历史', '社会'],
    collections: [],
    featured: false,
  },
};
const main = [
  '30-Second Recall',
  '3-Minute Overview',
  'Full Knowledge Note',
  'Key Takeaways',
  'Questions Worth Thinking About',
  'My Notes',
  'Source',
];
const report = [];
for (const file of (await fs.readdir('.')).filter(
  (f) => f.startsWith('Tao_Note_') && f.endsWith('.md'),
)) {
  const { data, content } = matter(await fs.readFile(file, 'utf8'));
  const m = mapping[data.source_bvid];
  if (!m) throw new Error(`未配置资源 ${file}`);
  const lines = content.split('\n');
  const hs = headings(content);
  let inFull = false;
  let inChapter = false;
  let skipped = false;
  let hasSubsection = false;
  for (const h of hs) {
    if (h.depth === 1 && !skipped) {
      lines[h.line] = '';
      skipped = true;
      continue;
    }
    if (main.includes(h.text)) {
      lines[h.line] = `## ${h.text}`;
      inFull = h.text === 'Full Knowledge Note';
      inChapter = false;
      continue;
    }
    if (h.depth === 1) {
      inChapter = /^\d+｜/.test(h.text);
      hasSubsection = false;
      lines[h.line] = `${inChapter ? '###' : '##'} ${h.text}`;
      continue;
    }
    if (inFull && inChapter && h.depth === 2) hasSubsection = true;
    const depth =
      inFull && inChapter
        ? h.depth === 2
          ? 4
          : hasSubsection
            ? Math.min(h.depth + 2, 6)
            : Math.min(h.depth + 1, 6)
        : Math.min(h.depth + 1, 6);
    lines[h.line] = `${'#'.repeat(depth)} ${h.text}`;
  }
  const metadata = {
    ...data,
    content_type: m.type,
    topics: m.topics,
    collections: m.collections,
    status: 'published',
    featured: m.featured,
    created_at: '2026-10-02',
    updated_at: '2026-10-02',
  };
  await fs.writeFile(
    `src/content/notes/${data.source_bvid}.md`,
    matter.stringify(lines.join('\n'), metadata),
  );
  report.push(
    `- ${file} → ${data.source_bvid}.md；原 topics: ${data.topics.join(' / ')} → ${m.topics.join(' / ')}；保留 note_version ${data.note_version} 和现有 passed 审核标记。`,
  );
}
await fs.writeFile(
  'docs/CONTENT_MIGRATION.md',
  `# 初始内容迁移\n\n2026-10-02。提供的资源是 4 篇实验笔记和 1 份流程报告；框架型原文未提供，不伪造。\n\n原文件保留在根目录。正文仅删除重复页面 H1、调整 Markdown 标题层级，不改写文本。细分 topic 保存在原文件，站点采用核心主题。published 表示站点收录，沿用输入文件声明的 fidelity_review 与 claim_provenance_review；未声称重新对照不存在的原字幕审核。My Notes 中只有空条目，没有生成私人内容。\n\n${report.join('\n')}\n`,
);
console.log('✓ 已迁移 4 篇笔记，正文措辞保持不变。');
