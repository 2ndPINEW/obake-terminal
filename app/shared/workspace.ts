export type WorkspaceManagerMode = 'MANAGED' | 'UNMANAGED';

export interface WorkspaceManagerInfo {
  mode: WorkspaceManagerMode;
  workspaces: Workspace[];
}

export type WorkspaceStatus = 'ACTIVE' | 'BACKGROUND' | 'INACTIVE';

export interface Workspace {
  name: string;
  cwd: string;
  status: WorkspaceStatus;
  color: `#${string}`;
  id: string;
  codeWorkspacePath: string;
}
