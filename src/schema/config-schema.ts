import z from 'zod';

export default z.object({
  development: z.object({
    store: z.string(),
    theme_id: z.string(),
    directory: z.string().optional(),
  }),
});
