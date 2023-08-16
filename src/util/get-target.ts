import z from 'zod';
import ConfigSchema from '../schema/config-schema';

export default (config: z.infer<typeof ConfigSchema>) => {
  try {
    const target = new URL(config.development.store);
    target.protocol = 'https';

    return target;
  } catch (e) {
    return new URL(`https://${config.development.store}`);
  }
};
