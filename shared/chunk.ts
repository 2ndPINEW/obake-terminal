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
  /** ターミナルからペインのリサイズを伝えるイベント */
  resize?: {
    cols: number;
    rows: number;
  };
}

export interface CreatePainChunk {
  id: string;
  size: {
    cols: number;
    rows: number;
  };
  cwd: string;
}

export const chunkToString = (chunk: Chunk): string => JSON.stringify(chunk);

export const stringToChunk = (input: string): Chunk =>
  JSON.parse(input) as Chunk;
