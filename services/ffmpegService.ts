
// Note: In a production environment, you'd load ffmpeg from a CDN.
// For this prototype, we define the structure of the FFmpeg interactions.
// We use the UMD version of ffmpeg.wasm for easier loading in single files.

export async function loadFFmpegCore() {
  // Logic to dynamically load FFmpeg.wasm
  // This is a placeholder for the actual dynamic loading sequence
  return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js';
      script.onload = () => resolve((window as any).FFmpeg);
      document.head.appendChild(script);
  });
}

export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
