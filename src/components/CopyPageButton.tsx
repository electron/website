import React, { useCallback, useEffect, useRef, useState } from 'react';

import styles from './CopyPageButton.module.scss';

const CopyIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function CopyPageButton(
  { rawMarkdown }: { rawMarkdown: string; /** Raw markdown source of the current page */ }
) {

  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const RESET_DELAY_MS = 2000;

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(rawMarkdown);

    setCopied(true);
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, RESET_DELAY_MS);
  }, [rawMarkdown]);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.copyButton}
        onClick={copied ? undefined : handleCopy}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span>Copy Page</span>
      </button>
      <span aria-live="polite" className={styles.srOnly}>
        {copied ? 'Page content copied to clipboard' : ''}
      </span>
    </div>
  );
};
