import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import matter from 'gray-matter';
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const root = path.resolve('dist');
async function files(dir: string): Promise<string[]> {
  return (
    await Promise.all(
      (await fs.readdir(dir, { withFileTypes: true })).map((d) =>
        d.isDirectory() ? files(path.join(dir, d.name)) : Promise.resolve([path.join(dir, d.name)]),
      ),
    )
  ).flat();
}
const html = (await files(root)).filter((f) => f.endsWith('.html'));
let checked = 0;
for (const file of html) {
  const source = await fs.readFile(file, 'utf8');
  assert.match(source, /<html lang="zh-CN"/);
  assert.equal((source.match(/<h1\b/g) || []).length, 1, `${file}: H1 必须唯一`);
  const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: HTML id 重复`);
  for (const m of source.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|data:)/.test(href)) continue;
    if (href.startsWith('#')) {
      assert.ok(ids.includes(decodeURIComponent(href.slice(1))), `${file}: 锚点不存在 ${href}`);
      continue;
    }
    if (!href.startsWith('/')) continue;
    assert.ok(!base || href.startsWith(base + '/'), `${file}: 未遵守 base ${href}`);
    const local = decodeURIComponent(href.split(/[?#]/)[0].slice(base.length));
    const candidate = path.join(root, local.endsWith('/') ? local + 'index.html' : local);
    await fs.access(candidate).catch(() => {
      throw new Error(`${file}: 内部链接/资产不存在 ${href}`);
    });
    checked++;
  }
  if (file.includes(`${path.sep}notes${path.sep}`)) {
    assert.match(source, /data-pagefind-body/);
    assert.ok(
      /<section data-pagefind-ignore(?:="")?>\s*<h2 id="source"/.test(source),
      `${file}: Source 必须忽略索引`,
    );
    const toc = source.match(/<aside class="toc"[\s\S]*?<\/aside>/)?.[0] || '';
    assert.ok(!/30-Second Recall|3-Minute Overview|Key Takeaways/.test(toc));
  }
}
const index = JSON.parse(
  await fs.readFile(path.join(root, 'pagefind/pagefind-entry.json'), 'utf8'),
);
assert.ok(index.languages['zh-cn']);
const count = (
  await Promise.all(
    (await fs.readdir('src/content/notes'))
      .filter((f) => f.endsWith('.md'))
      .map(
        async (f) =>
          matter(await fs.readFile(`src/content/notes/${f}`, 'utf8')).data.status === 'published',
      ),
  )
).filter(Boolean).length;
assert.equal(index.languages['zh-cn'].page_count, count);
console.log(
  `✓ ${html.length} 个静态页面、${checked} 个内部链接/资产、${count} 篇中文搜索索引、锚点与目录检查通过（base=${base || '/'}）。`,
);
