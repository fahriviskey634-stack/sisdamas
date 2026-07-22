import { MediaItem } from './types';

// Normalisasi photo_urls: bisa berupa string (URL lama) atau object {viewUrl, downloadUrl, driveUrl, type}
export const normalizeMedia = (item: any): MediaItem => {
  if (typeof item === 'string') {
    return { viewUrl: item, downloadUrl: item, driveUrl: item, type: 'image' };
  }
  return {
    viewUrl: item.viewUrl || item,
    downloadUrl: item.downloadUrl || item.viewUrl || item,
    driveUrl: item.driveUrl || item.viewUrl || item,
    type: item.type || 'image'
  };
};

// Helper pendownload file fisik (foto/video) aman
export const downloadSingleMedia = (media: MediaItem, index: number, programName?: string) => {
  const filename = `dokumentasi_${programName ? programName.replace(/\s+/g, '_') : 'kkn'}_${index + 1}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
  const url = media.downloadUrl || media.viewUrl;

  if (url.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
