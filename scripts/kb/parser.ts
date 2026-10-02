import matter from 'gray-matter';
import { bvidSchema } from '../../src/lib/schema';
export function parseBvid(text: string) {
  const values = [...new Set(text.match(/BV[1-9A-HJ-NP-Za-km-z]{10}/g) || [])];
  if (values.length !== 1)
    throw new Error('找不到唯一 BVID。请在字幕头部填写 bvid: "BV..."，并确保只有一个视频来源。');
  return bvidSchema.parse(values[0]);
}
export function parseTimestamp(s: string) {
  const plain = s.startsWith('[') && s.endsWith(']') ? s.slice(1, -1) : s;
  const p = plain.split(':').map(Number);
  if (
    !/^(?:\d{1,3}:\d{2}:\d{2}|\d{1,3}:\d{2})$/.test(plain) ||
    p.some((n) => !Number.isInteger(n) || n < 0) ||
    p.at(-1)! >= 60 ||
    (p.length === 3 && p[1] >= 60)
  )
    throw new Error(`时间戳无效：${s}。请使用 MM:SS 或 HH:MM:SS。`);
  return p.reduce((a, b) => a * 60 + b, 0);
}
export function parseSource(text: string) {
  const { data, content } = matter(text.replace(/^\uFEFF/, ''));
  const bvid = parseBvid(String(data.bvid || data.source_bvid || text));
  const field = (names: string[]) =>
    names
      .map((n) => data[n] || text.match(new RegExp(`^(?:${n})[：:]\\s*(.+)$`, 'mi'))?.[1])
      .find(Boolean);
  const title = field(['title', '标题', '视频标题']);
  const author = field(['author', 'source_author', '作者', 'UP主']);
  const date = field(['upload_date', 'source_date', 'date', '发布日期', '上传日期']);
  if (!title || !author || !date)
    throw new Error(
      '字幕缺少元信息。请添加 YAML 头部：title、author、upload_date（YYYY-MM-DD）、bvid。原文件不会被修改。',
    );
  const normalized =
    date instanceof Date ? date.toISOString().slice(0, 10) : String(date).trim().slice(0, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(normalized) ||
    Number.isNaN(Date.parse(normalized)) ||
    new Date(normalized).toISOString().slice(0, 10) !== normalized
  )
    throw new Error('发布日期无效，请使用 YYYY-MM-DD。');
  // Scraper exports include an iframe and a synopsis before the actual subtitles.
  // Keep raw bytes intact; only the derived transcript excludes that wrapper.
  const subtitleHeading = /^##\s+字幕\s*\r?$/m.exec(content);
  const transcript = subtitleHeading
    ? content.slice(subtitleHeading.index + subtitleHeading[0].length).replace(/^\r?\n/, '')
    : content;
  if (!transcript.trim()) throw new Error('字幕正文为空，请提供带时间戳的完整源材料。');
  return {
    bvid,
    title: String(title),
    author: String(author),
    date: normalized,
    url: `https://www.bilibili.com/video/${bvid}/`,
    transcript,
  };
}
