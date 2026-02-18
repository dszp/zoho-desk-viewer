import { useRef, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { Box } from '@mui/material';

interface HtmlContentProps {
  html: string;
  maxHeight?: number;
}

export function HtmlContent({ html, maxHeight }: HtmlContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(200);

  const sanitized = DOMPurify.sanitize(html, {
    ALLOW_TAGS: [
      'p', 'br', 'div', 'span', 'a', 'b', 'i', 'u', 'strong', 'em',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'blockquote', 'pre', 'code', 'hr', 'meta', 'style',
    ],
    ALLOW_ATTR: ['href', 'src', 'alt', 'style', 'class', 'target', 'rel', 'width', 'height', 'content', 'name'],
  });

  const srcdoc = `<!DOCTYPE html>
<html><head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; color: #333; margin: 8px; word-wrap: break-word; overflow-wrap: break-word; }
  a { color: #1976d2; }
  img { max-width: 100%; height: auto; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #ddd; padding: 4px 8px; }
  blockquote { border-left: 3px solid #ddd; margin: 8px 0; padding-left: 12px; color: #666; }
</style>
</head><body>${sanitized}</body></html>`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc?.body) {
          const h = doc.body.scrollHeight + 16;
          setHeight(maxHeight ? Math.min(h, maxHeight) : h);
        }
      } catch {
        // cross-origin restriction with sandbox
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [sanitized, maxHeight]);

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        srcDoc={srcdoc}
        sandbox=""
        style={{
          width: '100%',
          height: `${height}px`,
          border: 'none',
          overflow: 'hidden',
        }}
        title="Email content"
      />
    </Box>
  );
}
