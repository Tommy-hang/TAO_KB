import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import matter from 'gray-matter';
import { root, sourceDir, jobDir, writeJson, readJson, hash, exists } from '../scripts/kb/io';
import { verifyJob } from '../scripts/kb/verify';
import { checkGate } from '../scripts/kb/gate';
import { gates } from '../scripts/kb/schemas';
import { publishBatch } from '../scripts/kb/publish-batch';

test('manual import is immutable, QA failure blocks publish, stale draft invalidates pass', async () => {
  const id = 'BV1AA411c7mD';
  const dir = jobDir(id);
  const source = sourceDir(id);
  assert.equal(
    await exists(path.join(root, `src/content/notes/${id}.md`)),
    false,
    '测试目标已存在，停止以保护公开内容',
  );
  assert.equal(await exists(dir), false, '测试目录已存在，停止以保护本地内容');
  assert.equal(await exists(source), false, '测试源已存在，停止以保护本地内容');
  const fixture = path.join(root, `workspace/test-source-${id}.txt`);
  await fs.mkdir(path.dirname(fixture), { recursive: true });
  const raw = `---\ntitle: "合成测试，非真实视频"\nauthor: "测试"\nupload_date: "2026-10-02"\nbvid: "${id}"\n---\n[00:00] 测试前提\n[01:00] 测试结论\n`;
  const run = (...args: string[]) =>
    spawnSync(
      process.execPath,
      [
        path.join(root, 'node_modules/tsx/dist/cli.mjs'),
        path.join(root, 'scripts/kb/new.ts'),
        fixture,
        ...args,
      ],
      { cwd: root, encoding: 'utf8', windowsHide: true },
    );
  try {
    await fs.writeFile(fixture, raw);
    let r = run();
    assert.equal(r.status, 0, r.stderr);
    assert.equal(await fs.readFile(path.join(source, 'raw.txt'), 'utf8'), raw);
    assert.ok(await exists(path.join(dir, 'prompt-package/schemas.json')));
    assert.equal(await exists(path.join(dir, 'draft.md')), false);
    assert.equal(run().status, 1);
    assert.equal(run('--resume').status, 0);
    await fs.writeFile(fixture, raw + '修改');
    assert.equal(run('--force').status, 1);
    assert.equal(hash(await fs.readFile(path.join(source, 'raw.txt'))), hash(raw));
    const u = {
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
    await writeJson(path.join(dir, 'understanding.json'), u);
    await writeJson(path.join(dir, 'provenance.json'), {
      claims: [
        {
          summary: '测试推断',
          type: 'author-inference',
          sourceRange: '00:00-01:00',
          requiresAttribution: true,
          externalFactCheck: false,
        },
      ],
    });
    await writeJson(path.join(dir, 'coverage.json'), {
      ranges: [
        { sourceRange: '00:00-01:00', noteSection: '前提' },
        { sourceRange: '01:00-02:00', noteSection: '结论' },
      ],
    });
    const existing = matter(
      await fs.readFile(path.join(root, 'src/content/notes/BV1NM4m1f7HL.md'), 'utf8'),
    ).data;
    const body = `## 30-Second Recall\n测试\n## 3-Minute Overview\n测试\n## Full Knowledge Note\n### 前提\n作者提出条件\n### 结论\n作者推导结果\n## Key Takeaways\n测试\n## Questions Worth Thinking About\n测试\n## Source\n${id}\n`;
    await fs.writeFile(
      path.join(dir, 'draft.md'),
      matter.stringify(body, {
        ...existing,
        id: `tao-${id}`,
        title: '合成测试',
        source_author: '测试',
        source_date: '2026-10-02',
        source_bvid: id,
        source_url: `https://www.bilibili.com/video/${id}/`,
        status: 'draft',
        content_type: 'framework',
        collections: [],
        fidelity_review: 'pending',
        claim_provenance_review: false,
      }),
    );
    const allPass = Object.fromEntries(gates.map((g) => [g, 'PASS']));
    await writeJson(path.join(dir, 'verify.json'), {
      gates: { ...allPass, fidelity: 'FAIL' },
      issues: ['缺失条件'],
      summary: '失败测试',
    });
    await assert.rejects(() => verifyJob(id), /QA 未通过/);
    await assert.rejects(() => checkGate(id), /质量门禁未通过/);
    const publisher = spawnSync(
      process.execPath,
      [
        path.join(root, 'node_modules/tsx/dist/cli.mjs'),
        path.join(root, 'scripts/kb/publish.ts'),
        id,
        '--local',
        '--reviewed',
      ],
      { cwd: root, encoding: 'utf8', windowsHide: true },
    );
    assert.equal(publisher.status, 1);
    assert.equal(await exists(path.join(root, `src/content/notes/${id}.md`)), false);
    await writeJson(path.join(dir, 'verify.json'), {
      gates: allPass,
      issues: [],
      summary: '通过测试',
    });
    await verifyJob(id);
    await checkGate(id);
    await writeJson(path.join(dir, 'review.json'), {
      approved: true,
      draftHash: hash(await fs.readFile(path.join(dir, 'draft.md'))),
      reviewerKind: 'agent',
      authorization: 'synthetic test only',
    });
    await assert.rejects(() => publishBatch([id, id], () => {}), /重复/);
    await assert.rejects(() => publishBatch([id, 'BV1BB411c7mD'], () => {}));
    assert.equal(await exists(path.join(root, `src/content/notes/${id}.md`)), false);
    await assert.rejects(
      () =>
        publishBatch([id], () => {
          throw new Error('simulated build failure');
        }),
      /simulated build failure/,
    );
    assert.equal(await exists(path.join(root, `src/content/notes/${id}.md`)), false);
    const success = spawnSync(
      process.execPath,
      [
        path.join(root, 'node_modules/tsx/dist/cli.mjs'),
        path.join(root, 'scripts/kb/publish.ts'),
        id,
        '--local',
        '--reviewed',
      ],
      { cwd: root, encoding: 'utf8', windowsHide: true },
    );
    assert.equal(success.status, 0, success.stderr + success.stdout);
    const publicNote = matter(
      await fs.readFile(path.join(root, `src/content/notes/${id}.md`), 'utf8'),
    );
    assert.equal(publicNote.data.status, 'published');
    assert.equal(publicNote.content, body);
    assert.equal((await readJson(path.join(dir, 'state.json'))).status, 'published');
    assert.equal((await readJson(path.join(dir, 'review.json'))).reviewerKind, 'agent');
    assert.ok(await exists(path.join(root, `dist/notes/${id}/index.html`)));
    await fs.appendFile(path.join(dir, 'draft.md'), '\n改变后的草稿');
    await assert.rejects(() => checkGate(id), /发生改变/);
  } finally {
    await fs.rm(path.join(root, `src/content/notes/${id}.md`), { force: true });
    await fs.rm(dir, { recursive: true, force: true });
    await fs.rm(source, { recursive: true, force: true });
    await fs.rm(fixture, { force: true });
  }
});
