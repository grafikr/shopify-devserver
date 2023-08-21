export default (config: { store: string }) => {
  try {
    const target = new URL(config.store);
    target.protocol = 'https';

    return target;
  } catch (e) {
    return new URL(`https://${config.store}`);
  }
};
