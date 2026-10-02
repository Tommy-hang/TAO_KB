import type { NoteData } from './schema';
export function relatedScore(
  a: Pick<NoteData, 'topics' | 'tags' | 'collections'>,
  b: Pick<NoteData, 'topics' | 'tags' | 'collections'>,
) {
  return (
    (a.collections.some((c) => b.collections.includes(c)) ? 4 : 0) +
    [...new Set(a.topics)].filter((t) => b.topics.includes(t)).length * 3 +
    [...new Set(a.tags)].filter((t) => b.tags.includes(t)).length
  );
}
