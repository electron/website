import React, { useState } from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';
import clsx from 'clsx';
import styles from './InstallSteps.module.scss';

export default function InstallSteps() {
  const [channel, setChannel] = useState('stable');
  const { stable, alpha, beta, nightly } = usePluginData('releases-plugin');
  const isAlpha = alpha.tag_name.localeCompare(beta.tag_name) > 0;
  const prerelease = isAlpha ? alpha : beta;
  const releaseInfo = {
    stable: {
      invocation: 'electron@latest',
      deps: {
        electron: stable.tag_name,
        node: stable.deps.node,
        chromium: stable.deps.chrome,
      },
    },
    prerelease: {
      invocation: `electron@${prerelease.npm_dist_tags[0]}`,
      deps: {
        electron: prerelease.tag_name,
        node: prerelease.deps.node,
        chromium: prerelease.deps.chrome,
      },
    },
    nightly: {
      invocation: 'electron-nightly',
      deps: {
        electron: nightly.tag_name,
        node: nightly.deps.node,
        chromium: nightly.deps.chrome,
      },
    },
  };
  return (
    <div>
      <ul className="pills">
        <li
          className={clsx(
            'pills__item',
            channel === 'stable' && 'pills__item--active'
          )}
          onClick={() => setChannel('stable')}
        >
          Stable
        </li>
        <li
          className={clsx(
            'pills__item',
            channel === 'prerelease' && 'pills__item--active'
          )}
          onClick={() => setChannel('prerelease')}
        >
          Prerelease
        </li>
        <li
          className={clsx(
            'pills__item',
            channel === 'nightly' && 'pills__item--active'
          )}
          onClick={() => setChannel('nightly')}
        >
          Nightly
        </li>
      </ul>
      <div>
        <div className={styles.buttons}>
          <span className={styles.dot} style={{ background: '#f25f58' }} />
          <span className={styles.dot} style={{ background: '#fbbe3c' }} />
          <span className={styles.dot} style={{ background: '#58cb42' }} />
        </div>
        <pre className={styles.codeBlock}>
          <code>
            <span className="no-select">$ </span>npm install --save-dev{' '}
            {releaseInfo[channel].invocation}
            <span className={clsx(styles.codeComment, 'no-select')}>
              <br /># Electron {releaseInfo[channel].deps.electron}
              <br /># Node {releaseInfo[channel].deps.node}
              <br /># Chromium {releaseInfo[channel].deps.chromium}
            </span>
          </code>
        </pre>
      </div>
    </div>
  );
}
