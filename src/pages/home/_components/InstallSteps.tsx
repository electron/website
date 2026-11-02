import React, { useState } from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';
import clsx from 'clsx';
import styles from './InstallSteps.module.scss';
import semver from 'semver';
import CodeWindow from './CodeWindow.tsx';
import type { ReleasesPluginContent } from '../../../plugins/releases/index.tsx';

export default function InstallSteps() {
  const [channel, setChannel] = useState('stable');
  const { stable, prerelease, nightly } = usePluginData(
    'releases-plugin',
  ) as ReleasesPluginContent;
  const releaseInfo = {
    stable: {
      invocation: 'electron@latest',
      deps: {
        electron: stable.version,
        node: stable.node,
        chromium: stable.chrome,
      },
    },
    prerelease: {
      invocation: `electron@${semver.prerelease(prerelease.version)[0]}`,
      deps: {
        electron: prerelease.version,
        node: prerelease.node,
        chromium: prerelease.chrome,
      },
    },
    nightly: {
      invocation: 'electron-nightly',
      deps: {
        electron: nightly.version,
        node: nightly.node,
        chromium: nightly.chrome,
      },
    },
  };
  return (
    <div>
      <div className={styles.channels} role="tablist" aria-label="Channel">
        {(['stable', 'prerelease', 'nightly'] as const).map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={channel === name}
            className={clsx(
              styles.channel,
              channel === name && styles.channelActive,
            )}
            onClick={() => setChannel(name)}
          >
            {name === 'stable'
              ? 'Stable'
              : name === 'prerelease'
                ? 'Prerelease'
                : 'Nightly'}
          </button>
        ))}
      </div>
      <CodeWindow title="Terminal">
        <span className="no-select">$ </span>npm install --save-dev{' '}
        {releaseInfo[channel].invocation}
        <span className={clsx(styles.codeComment, 'no-select')}>
          <br /># Electron {releaseInfo[channel].deps.electron}
          <br /># Node {releaseInfo[channel].deps.node}
          <br /># Chromium {releaseInfo[channel].deps.chromium}
        </span>
      </CodeWindow>
    </div>
  );
}
