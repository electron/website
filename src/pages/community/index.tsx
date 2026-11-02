import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {
  ArrowUpRight,
  Bug,
  HandHeart,
  Languages,
  Mail,
  Megaphone,
  MessagesSquare,
  Scale,
  ShieldAlert,
} from 'lucide-react';

import styles from './community.module.scss';

const RESOURCES = [
  {
    icon: Megaphone,
    title: 'Stay up to date',
    body: (
      <>
        Follow{' '}
        <a href="https://bsky.app/profile/electronjs.org">@electronjs.org</a> on
        Bluesky and subscribe to the <Link to="/blog">blog feed</Link>.
      </>
    ),
  },
  {
    icon: MessagesSquare,
    title: 'Get help and feedback',
    body: (
      <>
        Ask in the <a href="https://www.reddit.com/r/electronjs">subreddit</a>{' '}
        or on{' '}
        <a href="https://stackoverflow.com/questions/tagged/electron">
          Stack Overflow
        </a>
        .
      </>
    ),
  },
  {
    icon: Languages,
    title: 'Contribute to translations',
    body: (
      <>
        Help translate these docs on{' '}
        <a href="https://crowdin.com/project/electron">Crowdin</a>.
      </>
    ),
  },
  {
    icon: ShieldAlert,
    title: 'Report security issues',
    body: (
      <>
        Report them privately through{' '}
        <a href="https://github.com/electron/electron/security">
          GitHub Security Advisories
        </a>
        .
      </>
    ),
  },
  {
    icon: Bug,
    title: 'Request features or report bugs',
    body: (
      <>
        Open an issue on the{' '}
        <a href="https://github.com/electron/electron/issues">
          electron/electron
        </a>{' '}
        repository.
      </>
    ),
  },
  {
    icon: Scale,
    title: 'Report Code of Conduct violations',
    body: (
      <>
        Email <a href="mailto:coc@electronjs.org">coc@electronjs.org</a>.
      </>
    ),
  },
  {
    icon: HandHeart,
    title: 'Donate',
    body: (
      <>
        Support the project on our{' '}
        <a href="https://opencollective.com/electron">OpenCollective page</a>.
      </>
    ),
  },
];

const LANGUAGE_COMMUNITIES = [
  {
    name: 'electron-zh',
    language: 'Chinese',
    href: 'https://discord.gg/eZTKXHBKpK',
  },
  {
    name: 'electron-ru',
    language: 'Russian',
    href: 'https://telegram.me/electron_ru',
  },
  {
    name: 'electron-br',
    language: 'Brazilian Portuguese',
    href: 'https://electron-br.slack.com/',
  },
  {
    name: 'electron-jp',
    language: 'Japanese',
    href: 'https://electron-jp.slack.com/',
  },
  {
    name: 'electron-tr',
    language: 'Turkish',
    href: 'https://electron-tr.herokuapp.com/',
  },
  {
    name: 'electron-id',
    language: 'Indonesian',
    href: 'https://electron-id.slack.com/',
  },
  {
    name: 'electron-pl',
    language: 'Polish',
    href: 'https://electronpl.github.io/',
  },
];

function Community() {
  return (
    <Layout title="Community">
      <header className={styles.hero}>
        <h1 className={styles.title}>Community</h1>
        <p className={styles.lead}>
          Resources for connecting with people working on Electron apps.
        </p>
      </header>
      <main className={styles.sheet}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Electron resources</h2>
          <div className={styles.resources}>
            {RESOURCES.map(({ icon: Icon, title, body }) => (
              <article key={title} className={styles.resource}>
                <span className={styles.resourceIcon}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
            <article className={styles.resourceContact}>
              <span className={styles.resourceIcon}>
                <Mail size={18} aria-hidden="true" />
              </span>
              <div>
                <h3>Anything else</h3>
                <p>
                  For all other inquiries, email{' '}
                  <a href="mailto:info@electronjs.org">info@electronjs.org</a>.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Language communities</h2>
          <p className={styles.sectionLead}>
            The Electron community spans the globe, and English is not
            everyone&apos;s first language. Find documentation in your language
            on this website, or join one of the language communities below:
          </p>
          <ul className={styles.languages}>
            {LANGUAGE_COMMUNITIES.map(({ name, language, href }) => (
              <li key={name}>
                <a className={styles.language} href={href}>
                  <span className={styles.languageName}>{language}</span>
                  <span className={styles.languageHandle}>
                    {name}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </Layout>
  );
}

export default Community;
