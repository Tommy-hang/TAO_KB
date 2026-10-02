import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { fileURLToPath } from 'node:url';
import { noteSchema, collectionSchema, pageSchema, bvidSchema } from '../../src/lib/schema';
import { validateBody } from './body';
import { root, jobDir, sourceDir, exists, readJson, cli } from './io';
import { understandingSchema, provenanceSchema, coverageSchema, verifySchema } from './schemas';
export function validateNote(text: string) {
  const { data, content } = matter(text.replace(/^\uFEFF/, ''));
  const n = noteSchema.parse(data);
  const errors = validateBody(content, n.source_bvid);
  if (errors.length) throw new Error(errors.join('\n'));
  return n;
}
export async function validateSite() {
  const notes = new Map();
  const ids = new Set();
  const collections = new Map();
  for (const file of (await fs.readdir(path.join(root, 'src/content/notes'))).filter((f) =>
    f.endsWith('.md'),
  )) {
    try {
      const n = validateNote(await fs.readFile(path.join(root, 'src/content/notes', file), 'utf8'));
      if (ids.has(n.id) || notes.has(n.source_bvid)) throw new Error('重复 id 或 BVID');
      if (file !== `${n.source_bvid}.md`) throw new Error('文件名必须为 BVID.md');
      ids.add(n.id);
      notes.set(n.source_bvid, n);
    } catch (e) {
      throw new Error(`${file}: ${e instanceof Error ? e.message : e}`);
    }
  }
  for (const file of (await fs.readdir(path.join(root, 'src/content/collections'))).filter((f) =>
    f.endsWith('.md'),
  )) {
    const c = collectionSchema.parse(
      matter(await fs.readFile(path.join(root, 'src/content/collections', file), 'utf8')).data,
    );
    if (collections.has(c.slug)) throw new Error(`专题重复 ${c.slug}`);
    if (new Set(c.notes).size !== c.notes.length)
      throw new Error(`专题 ${c.slug} 重复收录同一笔记`);
    for (const id of c.notes) {
      if (!notes.has(id) || (c.status === 'published' && notes.get(id).status !== 'published'))
        throw new Error(`专题 ${c.slug} 引用了不存在或未发布笔记 ${id}`);
    }
    collections.set(c.slug, c);
  }
  for (const n of notes.values())
    for (const c of n.collections) {
      if (!collections.has(c) || !collections.get(c).notes.includes(n.source_bvid))
        throw new Error(`${n.source_bvid}: 专题 ${c} 不存在或未收录此笔记`);
    }
  for (const file of (await fs.readdir(path.join(root, 'src/content/pages'))).filter((f) =>
    f.endsWith('.md'),
  ))
    pageSchema.parse(
      matter(await fs.readFile(path.join(root, 'src/content/pages', file), 'utf8')).data,
    );
  return notes.size;
}
export async function validateJob(id: string) {
  const dir = jobDir(id);
  for (const [name, schema] of [
    ['understanding', understandingSchema],
    ['provenance', provenanceSchema],
    ['coverage', coverageSchema],
    ['verify', verifySchema],
  ] as const) {
    const p = path.join(dir, `${name}.json`);
    if (!(await exists(p)))
      throw new Error(`缺少 ${name}.json。请按 prompt-package 中的阶段顺序生成。`);
    schema.parse(await readJson(p));
  }
  const n = validateNote(await fs.readFile(path.join(dir, 'draft.md'), 'utf8'));
  if (n.source_bvid !== id) throw new Error('草稿 BVID 与任务不一致');
  const meta = await readJson(path.join(sourceDir(id), 'meta.json'));
  const u = understandingSchema.parse(await readJson(path.join(dir, 'understanding.json')));
  if (n.status !== 'draft')
    throw new Error('编译草稿必须为 draft，发布状态只能由人工确认后的发布器设置。');
  if (n.source_author !== meta.author || n.source_date !== meta.date)
    throw new Error('草稿来源作者或日期与导入元信息不一致。');
  if (n.content_type !== u.contentType) throw new Error('草稿类型与理解地图不一致。');
  if (n.external_fact_check)
    throw new Error('当前编译流程没有外部事实核验，不能声明 external_fact_check: true。');
  return n;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await cli(async () => {
    const arg = process.argv[2];
    if (arg) {
      await validateJob(bvidSchema.parse(arg));
      console.log('✓ 本地草稿与结构化产物格式有效。运行 kb:verify 进行质量门禁。');
    } else console.log(`✓ 内容校验通过：${await validateSite()} 篇笔记。`);
  });
