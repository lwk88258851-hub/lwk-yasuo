
import React from 'react';

interface VideoPreviewProps {
  file: File | string;
  title: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ file, title }) => {
  const url = typeof file === 'string' ? file : URL.createObjectURL(file);

  return (
    <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700">
      <div className="p-3 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-300">{title}</span>
      </div>
      <div className="aspect-video bg-black flex items-center justify-center relative">
        <video 
          src={url} 
          controls 
          className="max-h-full max-w-full"
        />
      </div>
    </div>
  );
};

export default VideoPreview;
