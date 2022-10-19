import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

function Community() {
  return (
    <Layout title="Community">
      <div className={'hero hero--electron'}>
        <div className="container">
          <h1 className="hero__title">Community</h1>
          <p className="hero__subtitle">
            Resources for connecting with people working on Electron apps.
          </p>
        </div>
      </div>
      <div className={'container margin-vert--xl'}>
        <h2>Electron resources</h2>
        <ul>
          <li>
            📣 <strong>Stay up to date</strong> by following{' '}
            <a href="https://twitter.com/electronjs">@electronjs</a> on Twitter
            and subscribing to the <Link to="/blog">blog feed.</Link>
          </li>
          <li>
            🙋 <strong>Get help and feedback</strong> by joining the{' '}
            <a href="https://discord.gg/electronjs">Discord server</a>, or
            visiting{' '}
            <a href="https://stackoverflow.com/questions/tagged/electron">
              Stack Overflow
            </a>
            .
          </li>
          <li>
            🌏 <strong>Contribute to translations</strong> on{' '}
            <a href="https://crowdin.com/project/electron">Crowdin</a>.
          </li>
          <li>
            🔒 <strong>Report security issues</strong> by emailing{' '}
            <a href="mailto:security@electronjs.org">security@electronjs.org</a>
            .
          </li>
          <li>
            🐞 <strong>Request features</strong> or <strong>report bugs</strong>{' '}
            by opening issues on the{' '}
            <a href="https://github.com/electron/electron/issues">
              electron/electron
            </a>{' '}
            repository.
          </li>
          <li>
            ⚖️ <strong>Report Code of Conduct violations</strong> by emailing{' '}
            <a href="mailto:coc@electronjs.org">coc@electronjs.org</a>.
          </li>
          <li>
            💰 <strong>Donate</strong> on our{' '}
            <a href="https://opencollective.com/electron">
              OpenCollective page
            </a>
            .
          </li>
        </ul>
        <p>
          ❓ For all other inquiries, email{' '}
          <a href="mailto:info@electronjs.org">info@electronjs.org</a>.
        </p>
      </div>
      <div className={'container margin-vert--xl'}>
        <h2>Language communities</h2>
        <p>
          The Electron community spans the globe, and English is not
          everyone&apos;s first language. Find documentation in your language on
          this website, or join one of the language communities below:
          <ul>
            <li>
              <a href="https://discord.gg/eZTKXHBKpK">electron-zh</a>{' '}
              <i>(Chinese)</i>
            </li>
            <li>
              <a href="https://telegram.me/electron_ru">electron-ru</a>{' '}
              <i>(Russian)</i>
            </li>
            <li>
              <a href="https://electron-br.slack.com/">electron-br</a>{' '}
              <i>(Brazilian Portuguese)</i>
            </li>
            <li>
              <a href="https://electron-jp.slack.com/">electron-jp</a>{' '}
              <i>(Japanese)</i>
            </li>
            <li>
              <a href="https://electron-tr.herokuapp.com/">electron-tr</a>{' '}
              <i>(Turkish)</i>
            </li>
            <li>
              <a href="https://electron-id.slack.com/">electron-id</a>{' '}
              <i>(Indonesian)</i>
            </li>
            <li>
              <a href="https://electronpl.github.io/">electron-pl</a>{' '}
              <i>(Polish)</i>
            </li>
          </ul>
        </p>
      </div>
    </Layout>
  );
}

export default Community;
