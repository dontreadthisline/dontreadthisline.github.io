import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 笔记集合。状态只有三种，写的时候顺手标上，弃坑也是 honest record。
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    status: z.enum(['写着呢', '读完了', '弃坑']),
    tags: z.array(z.string()).default([]),
    summary: z.string().default(''),
    // 回头看时给自己的批注，会以手写便签的形式出现在文末
    marginalia: z.string().optional(),
  }),
});

export const collections = { notes };
