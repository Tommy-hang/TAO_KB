import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import matter from 'gray-matter';
import { root, jobDir, exists, readJson, writeJson, hash, state, cli, idArg } from './io';
import { verifyJob } from './verify';
import { checkGate } from './gate';
import { validateNote } from './validate';
function git(args: string[], capture = false) {
  const r = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    windowsHide: true,
  });
  if (r.error || r.status !== 0)
    throw new Error(`Git 操作失败：git ${args[0]}。请检查仓库、分支和远程配置。`);
  return r.stdout?.trim() || '';
}
function build() {
  const npm = process.env.npm_execpath;
  if (!npm) throw new Error('请通过 npm run publish 执行发布。');
  const r = spawnSync(process.execPath, [npm, 'run', 'build'], {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  if (r.error || r.status !== 0) throw new Error('生产构建未通过；未提交或推送。');
}
await cli(async () => {
  const id = idArg();
  const dir = jobDir(id);
  const local = process.argv.includes('--local');
  const dry = process.argv.includes('--dry-run');
  if (await exists(path.join(dir, 'gate.json'))) await checkGate(id);
  else await verifyJob(id);
  const hashes = await checkGate(id);
  const draft = await fs.readFile(path.join(dir, 'draft.md'), 'utf8');
  const n = validateNote(draft);
  if (!local && !dry) {
    git(['rev-parse', '--show-toplevel'], true);
    if (!git(['remote', 'get-url', 'origin'], true))
      throw new Error('缺少 origin 远程。请按 README 配置仓库。');
    if (git(['diff', '--cached', '--name-only'], true))
      throw new Error('暂存区已有其他修改。请先完成自己的提交，再发布一篇笔记。');
    const tracked = git(['ls-files', '--', 'workspace', '.env'], true);
    if (tracked) throw new Error('Git 已跟踪私有 workspace 或 .env。请先解除跟踪再发布。');
  }
  if (dry) {
    console.log('✓ QA 门禁与产物指纹有效。dry-run 不写入、不提交、不推送。');
    build();
    return;
  }
  const reviewPath = path.join(dir, 'review.json');
  let reviewRecord: Record<string, unknown> = {};
  let reviewed = process.argv.includes('--reviewed');
  if (await exists(reviewPath)) {
    const r = await readJson(reviewPath);
    reviewRecord = r;
    reviewed ||= r.approved === true && r.draftHash === hash(draft);
  }
  if (!reviewed) {
    if (!process.stdin.isTTY)
      throw new Error(
        `需要人工阅读 ${dir}/draft.md 与 qa.md。确认后使用 --reviewed，或在交互终端回答确认。`,
      );
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try {
      reviewed =
        (
          await rl.question(`确认已阅读 ${id} 的 draft.md 与 qa.md，允许发布？输入 yes：`)
        ).trim() === 'yes';
    } finally {
      rl.close();
    }
    if (!reviewed) throw new Error('已取消发布，草稿保持原样。');
  }
  await writeJson(reviewPath, {
    ...reviewRecord,
    approved: true,
    draftHash: hash(draft),
    reviewedAt: new Date().toISOString(),
  });
  const target = path.join(root, `src/content/notes/${id}.md`);
  const old = (await exists(target)) ? await fs.readFile(target, 'utf8') : null;
  if (old && !process.argv.includes('--replace'))
    throw new Error('公开笔记已存在。更新时显式使用 --replace；不会静默覆盖。');
  const { content } = matter(draft);
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const published = matter.stringify(content, {
    ...n,
    status: 'published',
    fidelity_review: 'passed',
    claim_provenance_review: true,
    updated_at: day,
  });
  validateNote(published);
  // QA checked source, draft, and every artifact. No publisher mutates the reviewed body.
  if (JSON.stringify(hashes) !== JSON.stringify(await checkGate(id)))
    throw new Error('发布前产物发生改变，请重新审核。');
  await fs.writeFile(target, published);
  let committed = false;
  let staged = false;
  try {
    build();
    if (!local) {
      git(['add', '--', `src/content/notes/${id}.md`]);
      staged = true;
      if (git(['diff', '--cached', '--name-only'], true)) {
        git(['commit', '-m', `Publish knowledge note ${id}`]);
        committed = true;
      }
      git(['push']);
    }
    await state(id, 'published', { publication: local ? 'local' : 'git-pushed' });
    console.log(
      local
        ? '✓ 笔记已本地发布；未提交或推送。'
        : '✓ 笔记已提交并推送；部署结果请查看 GitHub Actions。',
    );
  } catch (e) {
    if (!committed) {
      if (staged) git(['reset', '--', `src/content/notes/${id}.md`]);
      if (old === null) await fs.rm(target, { force: true });
      else await fs.writeFile(target, old);
    }
    await state(id, 'failed', {
      publication: committed ? 'committed-push-failed' : 'build-or-git-failed',
    });
    throw e;
  }
});
