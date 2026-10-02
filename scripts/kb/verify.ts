import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jobDir, sourceDir, readJson, writeJson, hash, state, idArg, cli } from './io';
import { validateJob } from './validate';
import { understandingSchema, coverageSchema, verifySchema, gates } from './schemas';
import { headings } from './body';
export async function artifactHashes(id: string) {
  const result: Record<string, string> = {};
  for (const name of [
    'understanding.json',
    'provenance.json',
    'coverage.json',
    'verify.json',
    'draft.md',
  ])
    result[name] = hash(await fs.readFile(path.join(jobDir(id), name)));
  result['clean.md'] = hash(await fs.readFile(path.join(sourceDir(id), 'clean.md')));
  result['raw.txt'] = hash(await fs.readFile(path.join(sourceDir(id), 'raw.txt')));
  return result;
}
export async function verifyJob(id: string) {
  await validateJob(id);
  const dir = jobDir(id);
  const meta = await readJson(path.join(sourceDir(id), 'meta.json'));
  if (hash(await fs.readFile(path.join(sourceDir(id), 'raw.txt'))) !== meta.rawHash)
    throw new Error('原始字幕被修改，不能通过验证。');
  const u = understandingSchema.parse(await readJson(path.join(dir, 'understanding.json')));
  const coverage = coverageSchema.parse(await readJson(path.join(dir, 'coverage.json')));
  const v = verifySchema.parse(await readJson(path.join(dir, 'verify.json')));
  const draft = await fs.readFile(path.join(dir, 'draft.md'), 'utf8');
  const issues = [...v.issues];
  for (const chapter of u.chapters) {
    const range = `${chapter.start}-${chapter.end}`;
    if (!coverage.ranges.some((r) => r.sourceRange.replace(/[–—]/g, '-') === range))
      issues.push(`缺少章节覆盖映射：${range}`);
  }
  const sections = new Set(
    headings(
      draft
        .split(/^---\s*$/m)
        .slice(2)
        .join('---'),
    ).map((h) => h.text),
  );
  for (const range of coverage.ranges) {
    if (range.noteSection && range.noteSection !== 'NONE' && !sections.has(range.noteSection))
      issues.push(`覆盖映射指向不存在的章节：${range.noteSection}`);
  }
  const failed = gates.filter((g) => v.gates[g] !== 'PASS');
  const passed = !failed.length && !issues.length;
  await fs.writeFile(
    path.join(dir, 'qa.md'),
    `# QA\n\n${v.summary}\n\n${gates.map((g) => `- ${g}: ${v.gates[g]}`).join('\n')}\n\n${issues.map((i) => `- ${i}`).join('\n')}\n\n${passed ? '结构与声明的七项质量检查通过；仍需人工阅读确认。' : '检查未通过，禁止发布。'}\n`,
  );
  await writeJson(path.join(dir, 'gate.json'), {
    passed,
    hashes: await artifactHashes(id),
    checkedAt: new Date().toISOString(),
  });
  await state(id, passed ? 'ready-for-review' : 'needs-repair');
  if (!passed)
    throw new Error(
      `QA 未通过：${[...failed, ...issues].join('；')}。请按 repair 提示词修复并重新验证。`,
    );
  console.log('✓ 七项 QA 门禁通过；等待人工阅读确认。');
  return true;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await cli(() => verifyJob(idArg()).then(() => {}));
