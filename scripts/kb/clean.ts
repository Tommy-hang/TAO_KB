import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sourceDir, jobDir, readJson, exists, state, hash, cli, idArg } from './io';
export async function clean(id: string) {
  const dir = sourceDir(id);
  const raw = await fs.readFile(path.join(dir, 'raw.txt'));
  const meta = await readJson(path.join(dir, 'meta.json'));
  if (hash(raw) !== meta.rawHash)
    throw new Error('raw.txt 已被修改。请恢复原始字幕；系统不会覆盖它。');
  const out = path.join(dir, 'clean.md');
  if (!(await exists(out))) {
    // Conservative hygiene: normalize line endings only. ASR corrections require human review.
    await fs.writeFile(out, String(meta.transcript).replace(/\r\n?/g, '\n'));
  }
  const current = (await exists(path.join(jobDir(id), 'state.json')))
    ? await readJson(path.join(jobDir(id), 'state.json'))
    : null;
  if (!current || ['imported', 'cleaned', 'failed'].includes(current.status))
    await state(id, 'cleaned');
  console.log('✓ 清理稿已保存（只规范换行；不推测 ASR 修正）');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await cli(() => clean(idArg()));
