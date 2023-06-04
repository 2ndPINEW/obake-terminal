import { app } from 'electron';
import * as os from 'node:os';
import * as path from 'node:path';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';

export type ExtractDataBlockTypeByKey<T extends DataBlock['key']> = Extract<
  DataBlock,
  { key: T }
>;

export type DataBlock =
  | {
      key: 'userData.restore-window-state';
      data: {
        x: number;
        y: number;
        width: number;
        height: number;
        isFullScreen: boolean;
      };
    }
  | {
      key: 'configData.app-config';
      data: {
        isDarkMode: boolean;
        apiPort: number;
        repositoryBasePath: string;
        workspaceConfigBasePath: string;
        fontFamily: string;
      };
    };

const DefaultValue: {
  [key in DataBlock['key']]: DataBlock['data'];
} = {
  'userData.restore-window-state': {
    x: 0,
    y: 0,
    width: 1280,
    height: 720,
    isFullScreen: false,
  },
  'configData.app-config': {
    isDarkMode: true,
    apiPort: 9435,
    repositoryBasePath: '~/dev',
    workspaceConfigBasePath: '~/.workspaces',
    fontFamily: 'sans-serif',
  },
};

const getDataPath = (key: DataBlock['key']): string => {
  const appName = app.getName();
  const [type, name] = key.split('.');

  if (key.startsWith('configData')) {
    return path.join(os.homedir(), '.config', appName, `${name}.json`);
  }
  const appDataPath = app.getPath(type as any);
  return path.join(appDataPath, `${name}.json`);
};

export const saveData = (data: DataBlock): void => {
  const { key, data: dataToSave } = data;
  const dataPath = getDataPath(key);

  // ディレクトリが存在しない場合は作成する
  const directoryPath = dataPath.substring(0, dataPath.lastIndexOf('/'));
  if (!existsSync(directoryPath)) {
    mkdirSync(directoryPath, { recursive: true });
  }

  writeFileSync(dataPath, JSON.stringify(dataToSave), 'utf8');
};

export const loadData = <T extends DataBlock['key']>(
  key: T
): Extract<DataBlock, { key: T }>['data'] => {
  try {
    const dataPath = getDataPath(key);
    if (!existsSync(dataPath)) {
      return DefaultValue[key] as any;
    }
    const data = readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return DefaultValue[key] as any;
  }
};
