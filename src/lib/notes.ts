import { getCollection } from 'astro:content';
import { relatedScore } from './related';
export async function publishedNotes() {
  return (await getCollection('notes', (n) => n.data.status === 'published')).sort(
    (a, b) => b.data.source_date.localeCompare(a.data.source_date) || a.id.localeCompare(b.id),
  );
}
export async function topicGroups() {
  const notes = await publishedNotes();
  return [...new Set(notes.flatMap((n) => n.data.topics))]
    .sort((a, b) => a.localeCompare(b, 'zh-CN'))
    .map((title) => ({ title, notes: notes.filter((n) => n.data.topics.includes(title)) }));
}
export async function publishedCollections() {
  return getCollection('collections', (c) => c.data.status === 'published');
}
export function recallExcerpt(body: string = '') {
  const s = body.split('## 30-Second Recall')[1]?.split('## 3-Minute Overview')[0] || '';
  return s
    .split('\n')
    .filter((l) => l.trim() && !/^\s*(#|---|```|>\s*$)/.test(l))
    .slice(0, 3)
    .join(' ')
    .replace(/[>*`]/g, '')
    .slice(0, 145);
}
export async function relatedNotes(id: string) {
  const notes = await publishedNotes();
  const current = notes.find((n) => n.id === id);
  if (!current) return [];
  return notes
    .filter((n) => n.id !== id)
    .map((n) => ({ note: n, score: relatedScore(current.data, n.data) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.note.id.localeCompare(b.note.id))
    .slice(0, 3)
    .map((x) => x.note);
}
