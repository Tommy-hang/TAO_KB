import fs from 'node:fs/promises';
import path from 'node:path';
import { parseSource } from './parser';
import { sourceDir, jobDir, writeJson, readJson, exists, state, hash, cli } from './io';
import { clean } from './clean';
import { compile } from './compile';
await cli(async () => {
  const file = process.argv[2];
  if (!file) throw new Error('请指定字幕文件：npm run new -- "./subtitle.txt"');
  const bytes = await fs.readFile(path.resolve(file));
  const meta = parseSource(bytes.toString('utf8'));
  const dir = sourceDir(meta.bvid);
  await fs.mkdir(dir, { recursive: true });
  await fs.mkdir(jobDir(meta.bvid), { recursive: true });
  const raw = path.join(dir, 'raw.txt');
  if (await exists(raw)) {
    const previous = await readJson(path.join(dir, 'meta.json'));
    if (previous.rawHash !== hash(bytes))
      throw new Error(
        `Source already exists: ${meta.bvid}。输入与保存的原字幕不同；不会覆盖 raw.txt。`,
      );
    if (!process.argv.includes('--resume') && !process.argv.includes('--force'))
      throw new Error(
        `Source already exists: ${meta.bvid}。使用 --resume 继续，或 --force 重建编译产物；原字幕始终保持原样。`,
      );
  } else {
    await fs.writeFile(raw, bytes, { flag: 'wx' });
    await writeJson(path.join(dir, 'meta.json'), { ...meta, rawHash: hash(bytes) });
    await state(meta.bvid, 'imported');
  }
  console.log(`✓ 原始字幕已保留：${meta.bvid}`);
  await clean(meta.bvid);
  await compile(meta.bvid, process.argv.includes('--api'));
});
