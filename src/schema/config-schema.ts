import z from 'zod';

export default z.object({
  development: z.object({
    store: z.string(),
    theme_id: z.union([z.string(), z.number()]),
    directory: z.string().optional(),
  }),
});
