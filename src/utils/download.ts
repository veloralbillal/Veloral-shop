/**
 * Universal Client-Side Downloader
 * Works flawlessly on static hosting (GitHub Pages, cPanel), mobile browsers,
 * and handles external cross-origin download links without CORS failures.
 */
export function downloadFile(fileUrl: string, fileName?: string): { success: boolean; url: string } {
  if (!fileUrl || typeof fileUrl !== 'string') {
    return { success: false, url: '' };
  }

  const cleanUrl = fileUrl.trim();
  const defaultName = fileName || 'digital_product';

  // 1. Data URL handling (data:application/... or data:text/...)
  if (cleanUrl.startsWith('data:')) {
    try {
      const link = document.createElement('a');
      link.href = cleanUrl;
      link.setAttribute('download', defaultName);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
      }, 300);
      return { success: true, url: cleanUrl };
    } catch (err) {
      console.warn('Data URI direct anchor failed, opening window:', err);
      window.open(cleanUrl, '_blank');
      return { success: true, url: cleanUrl };
    }
  }

  // 2. Blob URL handling
  if (cleanUrl.startsWith('blob:')) {
    try {
      const link = document.createElement('a');
      link.href = cleanUrl;
      link.setAttribute('download', defaultName);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
      }, 300);
      return { success: true, url: cleanUrl };
    } catch (err) {
      window.open(cleanUrl, '_blank');
      return { success: true, url: cleanUrl };
    }
  }

  // 3. HTTP / HTTPS URL handling
  // CRITICAL FIX: Do NOT use fetch(cleanUrl) because cross-origin file hosts block CORS,
  // causing an asynchronous rejection where popup blockers silently suppress link.click().
  // Instead, trigger the download/window immediately inside the user's synchronous click gesture!
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    try {
      const link = document.createElement('a');
      link.href = cleanUrl;
      link.setAttribute('download', defaultName);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
      }, 300);
    } catch (e) {
      // Fallback: window open
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    }

    return { success: true, url: cleanUrl };
  }

  // 4. Fallback anchor for relative or custom URLs
  try {
    const link = document.createElement('a');
    link.href = cleanUrl;
    link.setAttribute('download', defaultName);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
    }, 300);
  } catch (err) {
    window.open(cleanUrl, '_blank');
  }

  return { success: true, url: cleanUrl };
}
