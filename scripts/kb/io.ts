import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { bvidSchema } from '../../src/lib/schema';
export const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
try {
  process.loadEnvFile(path.join(root, '.env'));
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
}
export const sourceDir = (id: string) =>
  path.join(root, 'workspace', 'sources', bvidSchema.parse(id));
export const jobDir = (id: string) => path.join(root, 'workspace', 'jobs', bvidSchema.parse(id));
export const hash = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
export async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
export async function readJson(p: string) {
  return JSON.parse(await fs.readFile(p, 'utf8'));
}
export async function writeJson(p: string, data: unknown) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2) + '\n');
}
export async function state(id: string, status: string, extra: Record<string, unknown> = {}) {
  const p = path.join(jobDir(id), 'state.json');
  const old = (await exists(p)) ? await readJson(p) : {};
  await writeJson(p, { ...old, status, updatedAt: new Date().toISOString(), ...extra });
}
export function idArg() {
  return bvidSchema.parse(process.argv[2]);
}
export async function cli(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e) {
    const error = e as NodeJS.ErrnoException;
    const message =
      error.code === 'ENOENT'
        ? `找不到文件或目录：${error.path || '指定路径'}。请检查字幕路径，或先完成上一阶段产物。`
        : error.code === 'EACCES' || error.code === 'EPERM'
          ? `无法读写 ${error.path || '指定文件'}。请关闭占用该文件的程序，并检查目录权限。`
          : e instanceof Error
            ? e.message
            : '操作失败';
    console.error(`✗ ${message}\n请检查输入文件与 workspace 中的产物，修复后使用 --resume 继续。`);
    process.exitCode = 1;
  }
}
