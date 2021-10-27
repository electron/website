import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

import styles from './index.module.scss';
import clsx from 'clsx';

function Community() {
  return (
    <Layout title="Community">
      <div className={clsx('subtron', styles.subtron)}>
        <h1>Electron Community</h1>
        <p>Resources for connecting with people working on Electron.</p>
      </div>
      <div className={clsx('community_section', styles.community_section)}>
        <p>
          🐎 <Link to="/docs/latest/tutorial/introduction">Get started</Link>{' '}
          building an app by reading the{' '}
          <Link Link to="/docs/latest/tutorial/introduction">
            quick-start guide.
          </Link>
        </p>
        <p>
          📣 <a href="https://twitter.com/electronjs">Stay up to date</a> by
          following <a href="https://twitter.com/electronjs">@electronjs</a> on
          Twitter and subscribing to the <Link to="/blog">blog feed.</Link>
        </p>
        <p>
          🙋 <b>Get help and feedback</b> by joining the{' '}
          <a href="https://discord.gg/electron">Discord server</a>, or visiting{' '}
          <a href="https://stackoverflow.com/questions/tagged/electron">
            Stack Overflow
          </a>
          .
        </p>
        <p>
          🌍 <Link to="/languages">Read docs in your native language</Link> by
          visiting the <Link to="/languages">languages page</Link>.
        </p>
        <p>
          🔒 <a href="mailto:security@electronjs.org">Report security issues</a>{' '}
          by emailing{' '}
          <a href="mailto:security@electronjs.org">security@electronjs.org</a>.
        </p>
        <p>
          🐞{' '}
          <a href="https://github.com/electron/electron/issues">Report bugs</a>{' '}
          by opening issues on the{' '}
          <a href="https://github.com/electron/electron/issues">
            electron/electron
          </a>{' '}
          repository.
        </p>
        <p>
          💡{' '}
          <a href="https://github.com/electron/electron/issues">
            Request features
          </a>{' '}
          by opening issues on the{' '}
          <a href="https://github.com/electron/electron/issues">
            electron/electron
          </a>{' '}
          repository.
        </p>
        <p>
          ⚖️{' '}
          <a href="mailto:coc@electronjs.org">
            Report Code of Conduct violations
          </a>{' '}
          by emailing <a href="mailto:coc@electronjs.org">coc@electronjs.org</a>
          .
        </p>
        <p>
          💰 <Link to="/donors">Donate</Link> on our{' '}
          <Link to="/donors">OpenCollective page</Link>.
        </p>
        <p>
          ❓ For all other inquiries, email{' '}
          <a href="mailto:info@electronjs.org">info@electronjs.org</a>.
        </p>
      </div>
      <div className={clsx('community_section', styles.community_section)}>
        <h2>Language Communities</h2>
        <p>
          The Electron community spans the globe, and English is not everyone's
          first language. Find <Link to="/languages">documentation in your language</Link>, or join one of
          the language communities below:
          <ul>
              <li><a href="https://telegram.me/electron_ru">electron-ru</a> <i>(Russian)</i></li>
              <li><a href="https://electron-br.slack.com/">electron-br</a> <i>(Brazillian Portugese)</i></li>
              <li><a href="https://electron-kr.github.io/electron-kr">electron-kr</a> <i>(Korean)</i></li>
              <li><a href="https://electron-jp.slack.com/">electron-jp</a> <i>(Japanese)</i></li>
              <li><a href="https://electron-tr.herokuapp.com/">electron-tr</a> <i>(Turkish)</i></li>
              <li><a href="https://electron-id.slack.com/">electron-id</a> <i>(Indonesia)</i></li>
              <li><a href="https://electronpl.github.io/">electron-pl</a> <i>(Poland)</i></li>
          </ul>
        </p>
      </div>
    </Layout>
  );
}

export default Community;
