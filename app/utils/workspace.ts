import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'fs';
import { Workspace } from '../shared/workspace';
import { loadData } from './save-data';
import { extname, join } from 'path';
import { RequestWorkspaceAdd } from '../shared/chunk';
import { Logger } from './logger';
import { gitUrlRegex } from '../shared/constants/workspace';
import { simpleGit } from 'simple-git';

const appConfig = loadData('configData.app-config');
const homeDir = process.env.HOME;
const depth = 3;
const codeWorkspaceExtension = '.code-workspace';

const repositoryBasePath = appConfig.repositoryBasePath.startsWith('~/')
  ? `${homeDir}/${appConfig.repositoryBasePath.slice(2)}`
  : appConfig.repositoryBasePath.startsWith('/')
  ? appConfig.repositoryBasePath
  : appConfig.repositoryBasePath.startsWith('./')
  ? `${process.cwd()}/${appConfig.repositoryBasePath.slice(2)}`
  : `${process.cwd()}/${appConfig.repositoryBasePath}`;

const workspaceConfigBasePath = appConfig.workspaceConfigBasePath.startsWith(
  '~/'
)
  ? `${homeDir}/${appConfig.workspaceConfigBasePath.slice(2)}`
  : appConfig.workspaceConfigBasePath.startsWith('/')
  ? appConfig.workspaceConfigBasePath
  : appConfig.workspaceConfigBasePath.startsWith('./')
  ? `${process.cwd()}/${appConfig.workspaceConfigBasePath.slice(2)}`
  : `${process.cwd()}/${appConfig.workspaceConfigBasePath}`;

const codeWorkspaceBase = (path: string) => {
  return `{
  "folders": [
    {
      "path": "${path}"
    }
  ],
  "settings": {}
}`;
};

function getSubdirectories(directoryPath: string, depth: number): string[] {
  if (depth === 0) {
    return [];
  }

  const subdirectories: string[] = [];

  try {
    const files = readdirSync(directoryPath);

    files.forEach((file) => {
      const filePath = `${directoryPath}/${file}`;
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        subdirectories.push(filePath);

        const nestedSubdirectories = getSubdirectories(filePath, depth - 1);
        subdirectories.push(...nestedSubdirectories);
      }
    });
  } catch (error) {
    console.error(`Error reading directory: ${directoryPath}`, error);
  }

  return subdirectories;
}

function initWorkspace() {
  mkdirSync(workspaceConfigBasePath, { recursive: true });
  writeFileSync(
    `${workspaceConfigBasePath}/obake-workspaces${codeWorkspaceExtension}`,
    codeWorkspaceBase(workspaceConfigBasePath),
    { encoding: 'utf-8' }
  );
}

function listCodeWorkspaceFiles(directoryPath: string): {
  path: string;
  content: {
    folders: {
      path: string;
    }[];
  };
}[] {
  const jsonFiles: any[] = [];

  try {
    const isExist = existsSync(directoryPath);
    if (!isExist) {
      initWorkspace();
      return jsonFiles;
    }
    const files = readdirSync(directoryPath);

    files.forEach((file) => {
      const filePath = join(directoryPath, file);
      const stat = statSync(filePath);

      if (stat.isFile() && extname(filePath) === codeWorkspaceExtension) {
        const file = readFileSync(filePath, { encoding: 'utf-8' });
        jsonFiles.push({
          path: filePath,
          content: JSON.parse(file),
        });
      }
    });
  } catch (error) {
    console.error(`Error reading directory: ${directoryPath}`, error);
    // TODO: これ多分エラーユーザーに表示した方がいいやつ
  }

  return jsonFiles;
}

export const listWorkspace = (): Workspace[] => {
  const workspaceSettings = listCodeWorkspaceFiles(workspaceConfigBasePath);
  return workspaceSettings.map((workspaceSetting) => {
    return {
      cwd: workspaceSetting.content.folders[0].path,
      name:
        workspaceSetting.path
          .split('/')
          .pop()
          ?.replace('.code-workspace', '') || '',
      status: 'INACTIVE',
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      id: workspaceSetting.path,
    };
  });
};

export const addWorkspaceStep0ParseUrl = (data: RequestWorkspaceAdd) => {
  const { name, url } = data;
  const match = url.match(gitUrlRegex);
  if (!match || !match.groups) {
    return { error: 'Invalid git url' };
  }
  const isExistWorkspaceName = existsSync(
    `${workspaceConfigBasePath}/${name}${codeWorkspaceExtension}`
  );
  if (isExistWorkspaceName) {
    return { error: 'Workspace name is already exist' };
  }
  const {
    host: host1,
    user: user1,
    name: repoName1,
    host2,
    user2,
    name2: repoName2,
  } = match.groups;
  const host = host1 || host2;
  const user = user1 || user2;
  const repoName = repoName1 || repoName2;
  const localRepositoryPath = `${repositoryBasePath}/${host}/${user}/${repoName}`;
  return { host, user, repoName, localRepositoryPath };
};

export const addWorkspaceStep1Clone = async ({
  gitUrl,
  localRepositoryPath,
}: {
  gitUrl: string;
  localRepositoryPath: string;
}) => {
  const isExist = existsSync(localRepositoryPath);
  if (!isExist) {
    const git = simpleGit();
    try {
      await git.clone(gitUrl, localRepositoryPath);
    } catch {
      return { result: 'failure', localRepositoryPath };
    }
  }
  return { result: isExist ? 'skip' : 'success', localRepositoryPath };
};

export const addWorkspaceStep2CreateCodeWorkspace = ({
  name,
  localRepositoryPath,
}: {
  name: string;
  localRepositoryPath: string;
}) => {
  const filePath = `${workspaceConfigBasePath}/${name}${codeWorkspaceExtension}`;
  writeFileSync(filePath, codeWorkspaceBase(localRepositoryPath), {
    encoding: 'utf-8',
  });
  return { filePath };
};
