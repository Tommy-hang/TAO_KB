import { z } from 'zod';

export const bvidSchema = z
  .string()
  .regex(/^BV[1-9A-HJ-NP-Za-km-z]{10}$/, 'BVID 应为 BV 开头的 12 位标识');
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (s) => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s,
    '无效日期',
  );
export const contentTypes = [
  'framework',
  'observation',
  'narrative',
  'public-affairs',
  'case-analysis',
  'other',
] as const;
export const noteSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().trim().min(1),
    source_author: z.string().min(1),
    source_type: z.literal('video'),
    source_bvid: bvidSchema,
    source_url: z.url(),
    source_date: day,
    content_type: z.enum(contentTypes),
    topics: z.array(z.string().min(1)).min(1).max(5),
    tags: z.array(z.string().min(1)).min(1).max(12),
    collections: z.array(z.string()).default([]),
    status: z.enum(['draft', 'published', 'archived']),
    featured: z.boolean().default(false),
    note_version: z.string().min(1),
    transcript_available: z.boolean(),
    external_fact_check: z.boolean(),
    claim_provenance_review: z.boolean(),
    fidelity_review: z.enum(['passed', 'pending', 'failed']),
    political_viewpoint_note: z.boolean().default(false),
    created_at: day,
    updated_at: day,
  })
  .superRefine((n, ctx) => {
    if (n.id !== `tao-${n.source_bvid}`)
      ctx.addIssue({ code: 'custom', path: ['id'], message: 'id 必须为 tao-<BVID>' });
    if (n.source_url !== `https://www.bilibili.com/video/${n.source_bvid}/`)
      ctx.addIssue({ code: 'custom', path: ['source_url'], message: '来源 URL 与 BVID 不一致' });
    if (n.status === 'published' && (n.fidelity_review !== 'passed' || !n.claim_provenance_review))
      ctx.addIssue({
        code: 'custom',
        path: ['status'],
        message: '发布需要忠实度与观点归属审核通过',
      });
    if (n.content_type === 'public-affairs' && !n.political_viewpoint_note)
      ctx.addIssue({
        code: 'custom',
        path: ['political_viewpoint_note'],
        message: '公共事务笔记必须标注观点模式',
      });
  });
export type NoteData = z.infer<typeof noteSchema>;
export const collectionSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  status: z.enum(['draft', 'published']),
  notes: z.array(bvidSchema).min(1),
});
export const pageSchema = z.object({ title: z.string().min(1), description: z.string().min(1) });
