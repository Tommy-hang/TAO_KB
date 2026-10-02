import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import matter from 'gray-matter';
import { bvidSchema } from '../../src/lib/schema';
import { root, jobDir, exists, readJson, hash, state, cli } from './io';
import { checkGate } from './gate';
import { validateNote } from './validate';

// Prepare every note before mutating any. This allows a collection to reference
// multiple new notes without leaving a half-published site between builds.
export async function publishBatch(ids: string[], build: () => void, replace = false) {
  if (!ids.length || new Set(ids).size !== ids.length) throw new Error('BVID 列表为空或重复。');
  const prepared = [];
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
  for (const candidate of ids) {
    const id = bvidSchema.parse(candidate);
    const dir = jobDir(id);
    const fingerprints = await checkGate(id);
    const draft = await fs.readFile(path.join(dir, 'draft.md'), 'utf8');
    const note = validateNote(draft);
    if (note.source_bvid !== id || note.status !== 'draft') throw new Error(`${id}: 草稿不匹配。`);
    const review = await readJson(path.join(dir, 'review.json'));
    if (review.approved !== true || review.draftHash !== hash(draft))
      throw new Error(`${id}: 缺少与当前草稿匹配的编辑确认。`);
    const target = path.join(root, `src/content/notes/${id}.md`);
    const old = (await exists(target)) ? await fs.readFile(target, 'utf8') : null;
    if (old !== null && !replace) throw new Error(`${id}: 已存在；更新需 --replace。`);
    const published = matter.stringify(matter(draft).content, {
      ...note,
      status: 'published',
      fidelity_review: 'passed',
      claim_provenance_review: true,
      updated_at: day,
    });
    validateNote(published);
    prepared.push({ id, fingerprints, target, old, published });
  }
  for (const item of prepared)
    if (JSON.stringify(item.fingerprints) !== JSON.stringify(await checkGate(item.id)))
      throw new Error(`${item.id}: 发布前产物发生改变。`);
  const written = [];
  try {
    for (const item of prepared) {
      written.push(item);
      await fs.writeFile(item.target, item.published);
    }
    build();
  } catch (error) {
    for (const item of written) {
      if (item.old === null) await fs.rm(item.target, { force: true });
      else await fs.writeFile(item.target, item.old);
      await state(item.id, 'failed', { publication: 'batch-local-rolled-back' });
    }
    throw error;
  }
  for (const item of prepared)
    await state(item.id, 'published', { publication: 'local', batch: ids });
  console.log(`✓ ${prepared.length} 篇已本地发布；未提交或推送。`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await cli(async () => {
    if (!process.argv.includes('--local'))
      throw new Error('批量发布需要 --local；验收后统一提交笔记、专题和文档。');
    const ids = process.argv.slice(2).filter((s) => !s.startsWith('--'));
    await publishBatch(
      ids,
      () => {
        if (!process.env.npm_execpath) throw new Error('请使用 npm run publish:batch。');
        const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'build'], {
          cwd: root,
          stdio: 'inherit',
          windowsHide: true,
          env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
        });
        if (result.error || result.status !== 0)
          throw new Error('批量构建失败；恢复本批全部笔记。');
      },
      process.argv.includes('--replace'),
    );
  });
