export const requiredSections = [
  '30-Second Recall',
  '3-Minute Overview',
  'Full Knowledge Note',
  'Key Takeaways',
  'Questions Worth Thinking About',
  'Source',
];
export function headings(body: string) {
  let fenced = false;
  let fence = '';
  const result: { depth: number; text: string; line: number }[] = [];
  body.split('\n').forEach((l, i) => {
    const f = l.match(/^\s*(`{3,}|~{3,})/);
    if (f) {
      if (!fenced) {
        fenced = true;
        fence = f[1][0];
      } else if (f[1][0] === fence) {
        fenced = false;
      }
      return;
    }
    if (fenced) return;
    const h = l.match(/^(#{1,6})\s+(.+)$/);
    if (h) result.push({ depth: h[1].length, text: h[2].trim(), line: i });
  });
  return result;
}
export function validateBody(body: string, bvid: string) {
  const errors: string[] = [];
  const hs = headings(body);
  const lines = body.split('\n');
  if (hs.some((h) => h.depth === 1)) errors.push('正文不能包含 H1；页面标题由布局渲染。');
  for (const s of requiredSections) {
    const found = hs.filter((h) => h.depth === 2 && h.text === s);
    if (found.length !== 1) {
      errors.push(`必须且只能有一个 ## ${s}`);
      continue;
    }
    const start = found[0].line;
    const end = hs.find((h) => h.depth === 2 && h.line > start)?.line ?? lines.length;
    if (
      !lines
        .slice(start + 1, end)
        .join('\n')
        .replace(/[#\s>*`\-]/g, '')
    )
      errors.push(`${s} 不能为空。`);
  }
  const positions = requiredSections.map((s) => hs.findIndex((h) => h.depth === 2 && h.text === s));
  if (positions.every((p) => p >= 0) && positions.some((p, i) => i > 0 && p <= positions[i - 1]))
    errors.push('必需章节顺序不正确。');
  const full = hs.find((h) => h.depth === 2 && h.text === 'Full Knowledge Note');
  const end = hs.find((h) => h.depth === 2 && h.line > (full?.line ?? Infinity));
  if (
    !full ||
    hs.filter((h) => h.depth === 3 && h.line > full.line && h.line < (end?.line ?? Infinity))
      .length < 2
  )
    errors.push('Full Knowledge Note 至少需要两个 H3 章节。');
  const source = hs.find((h) => h.depth === 2 && h.text === 'Source');
  if (
    !source ||
    !lines
      .slice(source.line + 1)
      .join('\n')
      .includes(bvid)
  )
    errors.push('Source 必须包含与 Front Matter 一致的 BVID。');
  return errors;
}
