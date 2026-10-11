import React, { useMemo } from 'react';
import katex from 'katex';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

interface MathViewProps {
  math: string;
  block?: boolean;
  /** Alias of `block` (KaTeX terminology). */
  displayMode?: boolean;
  /** Explicit inline rendering (default). Ignored when block/displayMode is set. */
  inline?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block: blockProp = false, displayMode = false, className = '' }) => {
  const block = blockProp || displayMode;
  const html = useMemo(() => {
    try {
      // Clean up common string issues if needed
      const cleanMath = math.trim();
      return katex.renderToString(cleanMath, {
        displayMode: block,
        throwOnError: false,
        output: 'htmlAndMathml',
        trust: false, // never allow \href / \includegraphics / \url from untrusted (AI) input
        maxSize: 20,
        maxExpand: 500,
      });
    } catch (err) {
      console.warn('KaTeX rendering error for:', math, err);
      return `<span class="text-amber-400 font-mono text-xs">${escapeHtml(math)}</span>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`overflow-x-auto py-1 px-2 text-center text-slate-100 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block align-middle text-slate-100 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
