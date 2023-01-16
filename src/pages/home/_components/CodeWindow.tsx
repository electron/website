import React from 'react';

import styles from './CodeWindow.module.scss';

interface CodeWindowProps {
  children: React.ReactNode;
}

export default function CodeWindow({ children }: CodeWindowProps) {
  return (
    <div>
      <div className={styles.buttons}>
        <span className={styles.dot} style={{ background: '#f25f58' }} />
        <span className={styles.dot} style={{ background: '#fbbe3c' }} />
        <span className={styles.dot} style={{ background: '#58cb42' }} />
      </div>
      <pre className={styles.codeBlock}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
