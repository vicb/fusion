import Generator from '@vaadin/generator-typescript-core/Generator.js';
import createLogger from '@vaadin/generator-typescript-utils/createLogger.js';
import meow from 'meow';
import GeneratorIO from './GeneratorIO.js';
import { processInput } from './utils.js';

const {
  input: [input],
  flags: { outputDir, plugin: plugins, verbose },
} = meow(
  `
Usage:
  tsgen <OpenAPI JSON string>
  tsgen <OpenAPI file path>

Options:
  -h, --help             Show this screen
  -o, --output-dir       Output directory
  -p, --plugin <path>    Use the plugin loadable by <path>.
  --version              Show the app version
`,
  {
    importMeta: import.meta,
    flags: {
      outputDir: {
        alias: 'o',
        default: 'frontend/generated',
        type: 'string',
      },
      plugin: {
        alias: 'p',
        default: [],
        isMultiple: true,
        type: 'string',
      },
      verbose: {
        alias: 'v',
        type: 'boolean',
      },
    },
  },
);

const logger = createLogger({ verbose });

const io = new GeneratorIO(outputDir, logger);

const resolvedPlugins = await Promise.all(Array.from(new Set(plugins), (pluginPath) => io.loadPlugin(pluginPath)));
const generator = new Generator(resolvedPlugins, logger);

const files = await generator.process(await processInput(input, io));
await io.cleanOutputDir();
await Promise.all(files.map((file) => io.write(file)));
