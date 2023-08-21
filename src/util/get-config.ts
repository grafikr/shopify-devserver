import fs from 'fs';
import YAML from 'yaml';
import ConfigSchema from '../schema/config-schema';

export default () => {
  if (fs.existsSync('./config.yml')) {
    const data = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));

    return ConfigSchema.parse(data).development;
  }

  throw new Error('config.yml does not exists');
};
