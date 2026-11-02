import React from 'react';

import styles from './CodeWindow.module.scss';

interface CodeWindowProps {
  children: React.ReactNode;
  title?: string;
}

/** A terminal window: navy, with traffic lights and a title in its bar. */
export default function CodeWindow({ children, title }: CodeWindowProps) {
  return (
    <div className={styles.window}>
      <div className={styles.titleBar}>
        <span className={styles.dot} style={{ background: '#f25f58' }} />
        <span className={styles.dot} style={{ background: '#fbbe3c' }} />
        <span className={styles.dot} style={{ background: '#58cb42' }} />
        {title && <span className={styles.title}>{title}</span>}
      </div>
      <pre className={styles.codeBlock}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
