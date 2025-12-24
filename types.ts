
export enum CompressionStatus {
  IDLE = 'IDLE',
  LOADING_FFMPEG = 'LOADING_FFMPEG',
  ANALYZING = 'ANALYZING',
  COMPRESSING = 'COMPRESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface VideoMetadata {
  name: string;
  size: number;
  type: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface CompressionAdvice {
  targetBitrateKbps: number;
  resolution: string;
  preset: string;
  crf: number;
  explanation: string;
}

export interface CompressionResult {
  url: string;
  name: string;
  size: number;
  savedBytes: number;
}
