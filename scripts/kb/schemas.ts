import { z } from 'zod';
import { contentTypes } from '../../src/lib/schema';
import { parseTimestamp } from './parser';
const text = z.string().trim().min(1);
const texts = z.array(text);
const timestamp = text.refine((s) => {
  try {
    parseTimestamp(s);
    return true;
  } catch {
    return false;
  }
}, '时间戳应为 MM:SS 或 HH:MM:SS');
export const understandingSchema = z
  .object({
    coreQuestion: text,
    coreThesis: text,
    contentType: z.enum(contentTypes),
    nativeLogic: texts.min(1),
    chapters: z
      .array(
        z.object({
          start: timestamp,
          end: timestamp,
          title: text,
          purpose: text,
          keyLogic: texts.min(1),
          structuralCases: texts,
          dependsOn: texts,
        }),
      )
      .min(2),
    mustPreserve: texts.min(1),
    structuralCases: texts,
    compressibleRepetition: texts,
    systemVocabulary: texts,
    asrUncertainties: texts,
    numberingIssues: texts,
    distortionRisks: texts,
    eventTimeline: texts.optional(),
    interpretationTimeline: texts.optional(),
    evidenceLadder: z
      .array(
        z.object({
          observedCue: text,
          authorHypothesis: text,
          crossCheckEvidence: texts,
          context: text,
          confidence: z.enum(['low', 'medium', 'high']),
        }),
      )
      .optional(),
  })
  .superRefine((u, c) => {
    u.chapters.forEach((ch, i) => {
      if (parseTimestamp(ch.end) <= parseTimestamp(ch.start))
        c.addIssue({
          code: 'custom',
          path: ['chapters', i, 'end'],
          message: '章节终点必须晚于起点',
        });
    });
    if (
      u.contentType === 'narrative' &&
      (!u.eventTimeline?.length || !u.interpretationTimeline?.length)
    )
      c.addIssue({ code: 'custom', message: '叙事必须有事件与回顾解释两条时间轴' });
    if (u.contentType === 'observation' && !u.evidenceLadder?.length)
      c.addIssue({ code: 'custom', message: '观察方法必须包含 evidenceLadder' });
    if (u.evidenceLadder?.some((e) => !e.crossCheckEvidence.length && e.confidence !== 'low'))
      c.addIssue({ code: 'custom', message: '缺少交叉证据时 confidence 必须为 low' });
  });
export const provenanceSchema = z
  .object({
    claims: z
      .array(
        z.object({
          summary: text,
          type: z.enum([
            'direct-observation',
            'personal-experience',
            'author-inference',
            'external-factual-claim',
            'normative-value-claim',
          ]),
          sourceRange: text,
          requiresAttribution: z.boolean(),
          externalFactCheck: z.boolean(),
        }),
      )
      .min(1),
  })
  .superRefine((p, c) =>
    p.claims.forEach((cl, i) => {
      if (!['direct-observation'].includes(cl.type) && !cl.requiresAttribution)
        c.addIssue({
          code: 'custom',
          path: ['claims', i],
          message: '经验、推断、外部声称和价值判断必须保留归属',
        });
    }),
  );
export const gates = [
  'completeness',
  'fidelity',
  'logic',
  'clarity',
  'semanticCompression',
  'recall',
  'epistemicAttribution',
] as const;
export const verifySchema = z.object({
  gates: z.object(
    Object.fromEntries(gates.map((g) => [g, z.enum(['PASS', 'FAIL'])])) as Record<
      (typeof gates)[number],
      z.ZodEnum<{ PASS: 'PASS'; FAIL: 'FAIL' }>
    >,
  ),
  issues: texts,
  summary: text,
});
export const coverageSchema = z
  .object({
    ranges: z
      .array(
        z.object({
          sourceRange: text,
          noteSection: z.string(),
          omissionReason: z
            .enum(['exact-repetition', 'oral-noise', 'nonessential-joke', 'redundant-example'])
            .optional(),
        }),
      )
      .min(1),
  })
  .superRefine((r, c) =>
    r.ranges.forEach((e, i) => {
      if ((!e.noteSection || e.noteSection === 'NONE') && !e.omissionReason)
        c.addIssue({ code: 'custom', path: ['ranges', i], message: '遗漏时间段必须提供合法理由' });
    }),
  );
export const verificationPackageSchema = z.object({
  coverage: coverageSchema,
  verification: verifySchema,
});
