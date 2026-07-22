import { MediaItem } from './types';

// Normalisasi photo_urls: bisa berupa string (URL lama) atau object {viewUrl, downloadUrl, driveUrl, type}
export const normalizeMedia = (item: any): MediaItem => {
  if (!item) {
    return { viewUrl: '', downloadUrl: '', driveUrl: '', type: 'image' };
  }

  if (typeof item === 'string') {
    if (item.includes('mock-photo-general') || item.includes('mock-file-link')) {
      return { viewUrl: '', downloadUrl: '', driveUrl: '', type: 'image' };
    }
    return { viewUrl: item, downloadUrl: item, driveUrl: item, type: 'image' };
  }

  let viewUrl = item.viewUrl || item.url || '';
  let downloadUrl = item.downloadUrl || viewUrl;
  let driveUrl = item.driveUrl || viewUrl;

  if (typeof viewUrl === 'string' && (viewUrl.includes('mock-photo-general') || viewUrl.includes('mock-file-link'))) {
    viewUrl = '';
    downloadUrl = '';
    driveUrl = '';
  }

  return {
    viewUrl,
    downloadUrl,
    driveUrl,
    type: item.type || 'image'
  };
};

// Helper pendownload file fisik (foto/video) aman
export const downloadSingleMedia = (media: MediaItem, index: number, programName?: string) => {
  const filename = `dokumentasi_${programName ? programName.replace(/\s+/g, '_') : 'kkn'}_${index + 1}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
  const url = media.downloadUrl || media.viewUrl;

  if (!url || url.includes('mock-photo-general')) {
    alert('Link download file tidak valid. Silakan unggah ulang foto.');
    return;
  }

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
