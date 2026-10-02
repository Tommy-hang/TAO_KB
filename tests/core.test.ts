import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { parseBvid, parseTimestamp, parseSource } from '../scripts/kb/parser';
import { validateBody, requiredSections } from '../scripts/kb/body';
import { noteSchema } from '../src/lib/schema';
import { relatedScore } from '../src/lib/related';
import { understandingSchema, coverageSchema, provenanceSchema } from '../scripts/kb/schemas';
import { root } from '../scripts/kb/io';
import { validateSite } from '../scripts/kb/validate';

test('BVID extracts exact source, rejects ambiguous and malformed input', () => {
  assert.equal(parseBvid('https://www.bilibili.com/video/BV1NM4m1f7HL/'), 'BV1NM4m1f7HL');
  assert.throws(() => parseBvid('BV123'));
  assert.throws(() => parseBvid('BV1NM4m1f7HL BV1nW421N7KA'));
});
test('timestamps validate bounds and preserve long-video minutes', () => {
  assert.equal(parseTimestamp('28:43'), 1723);
  assert.equal(parseTimestamp('[01:02:03]'), 3723);
  assert.equal(parseTimestamp('120:00'), 7200);
  for (const s of ['00:60', '1:70:00', 'bad', '-1:20', '00:12.3'])
    assert.throws(() => parseTimestamp(s));
});
test('required sections ignore fenced pseudo-headings and reject duplicates/empty chapters', () => {
  const id = 'BV1NM4m1f7HL';
  const body = requiredSections
    .map(
      (s) =>
        `## ${s}\n${s === 'Full Knowledge Note' ? '### A\n论证\n### B\n案例' : s === 'Source' ? id : '实际内容'}`,
    )
    .join('\n');
  assert.deepEqual(validateBody(body, id), []);
  assert.ok(validateBody(body + '\n## Source\n' + id, id).length);
  assert.ok(validateBody(body.replace('## Source', '```\n## Source') + '\n```', id).length);
  assert.ok(validateBody(body.replace('### B', '#### B'), id).length);
});
test('related score uses one collection boost, topics and tags; zero is meaningful', () => {
  const a = { topics: ['认知', '心理'], tags: ['判断'], collections: ['a', 'b'] };
  assert.equal(relatedScore(a, { topics: ['认知'], tags: ['判断'], collections: ['a', 'b'] }), 8);
  assert.equal(relatedScore(a, { topics: [], tags: [], collections: [] }), 0);
});
test('all four supplied real notes validate and retain original wording', async () => {
  assert.ok((await validateSite()) >= 4);
  for (const file of (await fs.readdir(root)).filter(
    (f) => f.startsWith('Tao_Note_') && f.endsWith('.md'),
  )) {
    const original = matter(await fs.readFile(path.join(root, file), 'utf8'));
    const migrated = matter(
      await fs.readFile(
        path.join(root, `src/content/notes/${original.data.source_bvid}.md`),
        'utf8',
      ),
    );
    const strip = (s: string, dropTitle = false) =>
      s
        .split('\n')
        .filter((l) => !(dropTitle && l === `# ${original.data.title}`))
        .map((l) => l.replace(/^#{1,6} /, ''))
        .join('\n')
        .replace(/^\s+|\s+$/g, '');
    assert.equal(strip(original.content, true), strip(migrated.content));
  }
});
test('published schema rejects invalid date, source mismatch and pending review', async () => {
  const data = matter(
    await fs.readFile(path.join(root, 'src/content/notes/BV1NM4m1f7HL.md'), 'utf8'),
  ).data;
  assert.ok(noteSchema.safeParse(data).success);
  for (const patch of [
    { source_date: '2024-02-30' },
    { source_url: 'https://example.com/' },
    { fidelity_review: 'pending' },
    { topics: [] },
    { id: 'other' },
  ])
    assert.equal(noteSchema.safeParse({ ...data, ...patch }).success, false);
});
const understanding = {
  coreQuestion: '测试问题',
  coreThesis: '测试结论',
  contentType: 'framework',
  nativeLogic: ['前提 → 结论'],
  chapters: [
    {
      start: '00:00',
      end: '01:00',
      title: '前提',
      purpose: '引入',
      keyLogic: ['条件'],
      structuralCases: [],
      dependsOn: [],
    },
    {
      start: '01:00',
      end: '02:00',
      title: '结论',
      purpose: '回扣',
      keyLogic: ['推导'],
      structuralCases: [],
      dependsOn: ['前提'],
    },
  ],
  mustPreserve: ['条件'],
  structuralCases: [],
  compressibleRepetition: [],
  systemVocabulary: [],
  asrUncertainties: [],
  numberingIssues: [],
  distortionRisks: [],
};
test('five compiler strategies: synthetic framework plus narrative/observation requirements', () => {
  assert.ok(understandingSchema.safeParse(understanding).success);
  assert.equal(
    understandingSchema.safeParse({ ...understanding, contentType: 'narrative' }).success,
    false,
  );
  assert.ok(
    understandingSchema.safeParse({
      ...understanding,
      contentType: 'narrative',
      eventTimeline: ['当时做事'],
      interpretationTimeline: ['后来理解'],
    }).success,
  );
  assert.equal(
    understandingSchema.safeParse({ ...understanding, contentType: 'observation' }).success,
    false,
  );
  assert.ok(
    understandingSchema.safeParse({
      ...understanding,
      contentType: 'observation',
      evidenceLadder: [
        {
          observedCue: '动作',
          authorHypothesis: '可能紧张',
          crossCheckEvidence: [],
          context: '访谈',
          confidence: 'low',
        },
      ],
    }).success,
  );
  for (const contentType of ['public-affairs', 'case-analysis'])
    assert.ok(understandingSchema.safeParse({ ...understanding, contentType }).success);
});
test('coverage rejects unexplained omission; provenance rejects un-attributed inference', () => {
  assert.equal(
    coverageSchema.safeParse({ ranges: [{ sourceRange: '00:00-01:00', noteSection: 'NONE' }] })
      .success,
    false,
  );
  assert.ok(
    coverageSchema.safeParse({
      ranges: [{ sourceRange: '00:00-01:00', noteSection: 'NONE', omissionReason: 'oral-noise' }],
    }).success,
  );
  assert.equal(
    provenanceSchema.safeParse({
      claims: [
        {
          summary: '推断',
          type: 'author-inference',
          sourceRange: '00:00-01:00',
          requiresAttribution: false,
          externalFactCheck: false,
        },
      ],
    }).success,
    false,
  );
});
test('importer requires explicit metadata and does not execute source text', () => {
  assert.throws(() => parseSource('BV1NM4m1f7HL'));
  const source =
    '---\ntitle: "$(do not execute)"\nauthor: "测试"\nupload_date: "2026-10-02"\nbvid: "BV1NM4m1f7HL"\n---\n[00:00] 原文\n';
  const result = parseSource(source);
  assert.equal(result.title, '$(do not execute)');
  assert.equal(result.date, '2026-10-02');
});

test('scraper export keeps timestamped subtitles and excludes iframe and synopsis', () => {
  const source =
    '---\ntitle: "导出"\nauthor: "作者"\nupload_date: "2026-10-02"\nbvid: "BV1NM4m1f7HL"\n---\n<iframe src="example"></iframe>\n## 简介\n不是字幕\n## 字幕\n`00:00:00` 真正字幕\n`00:00:02` 第二句\n';
  assert.equal(parseSource(source).transcript, '`00:00:00` 真正字幕\n`00:00:02` 第二句\n');
  assert.throws(() => parseSource(source.slice(0, source.indexOf('`00:00:00`'))));
});
