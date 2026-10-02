import path from 'node:path';
import { readJson, jobDir } from './io';
import { artifactHashes } from './verify';
export async function checkGate(id: string) {
  const gate = await readJson(path.join(jobDir(id), 'gate.json'));
  if (!gate.passed) throw new Error('质量门禁未通过。先运行 npm run kb:verify。');
  const current = await artifactHashes(id);
  if (Object.entries(current).some(([k, v]) => gate.hashes[k] !== v))
    throw new Error('草稿或源材料在 QA 后发生改变，必须重新运行 kb:verify。');
  return current;
}
