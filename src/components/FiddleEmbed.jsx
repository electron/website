import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

import styles from './FiddleEmbed.module.scss';

const filePriority = {
  'main.js': 4,
  'preload.js': 3,
  'index.html': 2,
  'renderer.js': 1,
}

const FiddleButton = (props) => {
  const { files, focus, version, dir } = props;

  // NOTE: We hack together the version path using Docusaurus directories
  // but the actual directories on `e/e` don't contain that section of the path.
  // in fs : docs/latest/fiddles/path/to/fiddle/ 
  //    or   docs/v14-x-y/fiddles/path/to/fiddle/
  // in e/e: docs/fiddles/path/to/fiddle/
  const gitDir = dir.replace(/docs\/[a-zA-Z0-9-]+\/fiddles/, 'docs/fiddles');

  const fileNames = Object.keys(files).sort((a,b) => {
    return filePriority[b] - filePriority[a]
  });
  const tabValues = fileNames.map(file => ({
    label: file,
    value: file,
  }));
  return (
    <EditorWindow version={version} gitDir={gitDir}>
      <Tabs
        values={tabValues}
        defaultValue={focus || 'main.js'}
      >
      {
        fileNames.map((file) => {
          return (
            <TabItem value={file} key={file}>
              <CodeBlock className={`language-${file.split('.').pop()}`}>
              {files[file]}
              </CodeBlock>
            </TabItem>
          )
        })
      }
      </Tabs>
      </EditorWindow>
  )
}

/**
 * Adapted facebook/docusaurus
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function EditorWindow({children, version, gitDir}) {
  return (
    <div className={styles.editorWindow}>
      <div className={styles.editorWindowHeader}>
        <div className={styles.buttons}>
          <span className={styles.dot} style={{background: '#f25f58'}} />
          <span className={styles.dot} style={{background: '#fbbe3c'}} />
          <span className={styles.dot} style={{background: '#58cb42'}} />
        </div>
        <a className={styles.editorTitle} href={`https://github.com/electron/electron/tree/v${version}/${gitDir}`}>{gitDir} ({version})</a>
        <a
          target="_blank"
          className="button button--primary button--md"
          href={`https://fiddle.electronjs.org/launch?target=electron/v${version}/${gitDir}`}
        >
          Open in Fiddle
        </a>
      </div>
      <div className={styles.editorWindowBody}>
        {children}
      </div>
    </div>
  );
}

export default FiddleButton;
