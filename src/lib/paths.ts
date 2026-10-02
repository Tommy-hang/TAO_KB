export function withBase(path = '') {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
}
export const notePath = (bvid: string) => withBase(`notes/${bvid}/`);
export const topicPath = (topic: string) => withBase(`topics/${encodeURIComponent(topic)}/`);
