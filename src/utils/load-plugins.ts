import * as path from 'path';
import { AutoRelease } from '../main';
import ChromeWebStorePlugin from '../plugins/chrome';
import NPMPlugin from '../plugins/npm';
import { ILogger } from './logger';
import tryRequire from './try-require';

export type IPluginConstructor = new (options?: any) => IPlugin;

export interface IPlugin {
  name: string;
  apply(auto: AutoRelease): void;
}

type SupportedPlugin = 'npm' | 'chrome';
const plugins = new Map<SupportedPlugin, IPluginConstructor>([
  ['npm', NPMPlugin],
  ['chrome', ChromeWebStorePlugin]
]);

function isSupported(key: SupportedPlugin | string): key is SupportedPlugin {
  return !!plugins.get(key as SupportedPlugin);
}

export default function loadPlugin(
  [pluginPath, options]: [SupportedPlugin | string, any],
  logger: ILogger
): IPlugin | undefined {
  let plugin: IPluginConstructor | undefined;

  if (isSupported(pluginPath)) {
    plugin = plugins.get(pluginPath);
  } else {
    plugin = tryRequire(pluginPath);

    if (!plugin) {
      plugin = tryRequire(path.join(process.cwd(), pluginPath));
    }
  }

  if (!plugin) {
    logger.log.warn(`Could not find plugin: ${pluginPath}`);
    return;
  }

  return new plugin(options);
}