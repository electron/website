import React, { useCallback, useEffect, useRef, useState } from 'react';

import { CheckIcon, CopyIcon } from './icons';
import styles from './styles.module.scss';

interface CopyPageButtonProps {
  /** Raw markdown source of the current page */
  rawMarkdown: string;
}

const RESET_DELAY_MS = 2000;

const CopyPageButton = ({ rawMarkdown }: CopyPageButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const writeWithFallback = () => {
      const textarea = document.createElement('textarea');
      textarea.value = rawMarkdown;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(textarea);
      }
    };

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(rawMarkdown);
      } else {
        writeWithFallback();
      }
    } catch {
      writeWithFallback();
    }

    setCopied(true);
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, RESET_DELAY_MS);
  }, [rawMarkdown]);

  const buttonClassName = copied
    ? `${styles.copyButton} ${styles.copied}`
    : styles.copyButton;

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={buttonClassName}
        onClick={handleCopy}
        aria-label="Copy page content to clipboard"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span>{copied ? 'Copied' : 'Copy Page'}</span>
      </button>
      <span aria-live="polite" className={styles.srOnly}>
        {copied ? 'Page content copied to clipboard' : ''}
      </span>
    </div>
  );
};

export default CopyPageButton;
