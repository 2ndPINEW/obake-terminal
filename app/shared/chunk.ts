import { DataBlock } from '../utils/save-data';
import { WorkspaceManagerInfo, WorkspaceManagerMode } from './workspace';

export interface Chunk {
  /** ターミナルからシェルへの入力 */
  input?: string;
  /** シェルからターミナルへの出力 */
  output?: string;
  /** ターミナルからペインの作成を指示するイベント */
  createPain?: CreatePainChunk;
  /** ペイン作成時のエラーを伝えるイベント */
  createPainError?: {
    id: string;
    message: string;
  };
  requestPainRemove?: string;
  /** ターミナルからペインのリサイズを伝えるイベント */
  resize?: {
    cols: number;
    rows: number;
  };
  /** ターミナルからメインプロセスにワークスペースの情報を送るようにリクエストする */
  requestWorkspaceManagerInfo?: true;
  /**
   * メインプロセスからターミナルにワークスペースの情報を送る
   * API経由で変更があったり外部からの変更があった場合も全部ここから送る
   */
  workspaceManagerInfo?: WorkspaceManagerInfo;
  /** ターミナルからメインプロセスにワークスペース切り替えをリクエストする */
  requestWorkspaceSwitch?: string;
  /** ターミナルからメインプロセスにワークスペースの追加をリクエストする */
  requestWorkspaceAdd?: RequestWorkspaceAdd;
  /** ワークスペース作成中の進捗をターミナル側に送る */
  workspaceAddProgress?: {
    step: number;
    message: string;
    failed?: boolean;
  };
  /** ターミナルでモード変更時にメインプロセスに状態を送っておく */
  workspaceManagerModeChanged?: WorkspaceManagerMode;
  /** ターミナルから設定の値読み取りをリクエスト */
  requestSettingRead?: DataBlock['key'];
  /** メインプロセスからターミナルに設定の値を送る */
  setting?: DataBlock;
  /** ターミナルから設定の値書き込みをリクエスト */
  requestSettingWrite?: SettingWriteRequest;
  settingWriteStatus?: {
    requestId: string;
    status: 'success' | 'error';
  };
}

export type SettingWriteRequest = DataBlock & {
  requestId: string;
};

export interface CreatePainChunk {
  id: string;
  size: {
    cols: number;
    rows: number;
  };
  cwd: string;
}

export interface RequestWorkspaceAdd {
  name: string;
  url:
    | `https://${string}/${string}/${string}.git`
    | `git@${string}:${string}/${string}.git`;
}

export const chunkToString = (chunk: Chunk): string => JSON.stringify(chunk);

export const stringToChunk = (input: string): Chunk =>
  JSON.parse(input) as Chunk;
