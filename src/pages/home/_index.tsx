import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import clsx from 'clsx';

import CrossPlatform from '@site/static/assets/img/cross-platform.svg';
import OpenSource from '@site/static/assets/img/open-source.svg';
import WebTech from '@site/static/assets/img/web-tech.svg';

import styles from './_index.module.scss';
import { HeroAnimation } from './_components/Header';
import AppsGrid from './_components/AppsGrid';
import InstallSteps from './_components/InstallSteps';
import Feature from './_components/Feature';
import TechnologiesGrid from './_components/TechnologiesGrid';
import CodeWindow from './_components/CodeWindow';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.tagline} description={siteConfig.tagline}>
      <header className={clsx('hero', 'hero--primary', styles.heroElectron)}>
        <div className="container">
          <div className="row">
            <div className="col col--12">
              <HeroAnimation />
            </div>
            <div className={clsx('col col--12', styles.heroHeadline)}>
              <h1>{siteConfig.tagline}</h1>
              <Link
                className="button button--electron button--dark button--lg"
                to="/docs/latest/"
              >
                Docs
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="container">
          <div className={clsx(styles.section)}>
            <div className={clsx('row', styles.blurb)}>
              <div className={clsx('col', styles.blurb2)}>
                <WebTech width={48} height={48} />
                <h3>Web Technologies</h3>
                <p>
                  Electron embeds Chromium and Node.js to enable web developers
                  to create desktop applications.
                </p>
              </div>
              <div className={clsx('col', styles.blurb2)}>
                <CrossPlatform width={48} height={48} />
                <h3>Cross Platform</h3>
                <p>
                  Compatible with macOS, Windows, and Linux, Electron apps run
                  on three platforms across all supported architectures.
                </p>
              </div>
              <div className={clsx('col', styles.blurb2)}>
                <OpenSource width={48} height={48} />
                <h3>Open Source</h3>
                <p>
                  Electron is an open source project maintained by the{' '}
                  <Link to="https://openjsf.org/">OpenJS Foundation</Link> and
                  an active community of contributors.
                </p>
              </div>
            </div>
          </div>
          <div className={clsx(styles.section)}>
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
              <h2>Desktop development made easy</h2>
              <p>
                Electron takes care of the hard parts so you can focus on the
                core of your application.
              </p>
            </div>
            <Feature
              title="Native graphical user interfaces"
              src="/assets/marketing/menu.png"
              alt="macOS operating system menu for VSCode.
              'Code' menu item is selected, and its submenu has items 'About Visual Studio Code',
              'Check for Updates...', 'Preferences', 'Services', 'Hide Visual Studio Code',
              'Hide Others', 'Show All', 'Quit Visual Studio Code'."
            >
              Interact with your operating system&apos;s interfaces with
              Electron&apos;s main process APIs. Customize your{' '}
              <Link to="/docs/latest/tutorial/window-customization">
                application window
              </Link>{' '}
              appearance, control application{' '}
              <Link to="/docs/latest/api/menu">menus</Link>, or alert users
              through <Link to="/docs/latest/api/dialog">dialogs</Link> or{' '}
              <Link to="/docs/latest/tutorial/notifications">
                notifications
              </Link>
              .
            </Feature>
            <Feature
              title="Automatic software updates"
              src="/assets/marketing/auto-updater.png"
              alt="Dialog for Electron Fiddle's auto-update. The user is prompted to update to v0.27.3.
              'A new version has been downloaded. Restart the application to apply the updates.'
              There are two buttons underneath: 'Later' and 'Restart'.
              "
            >
              Send out software updates to your macOS and Windows users whenever
              you release a new version with Electron&apos;s{' '}
              <Link to="/docs/latest/api/auto-updater">autoUpdater module</Link>
              , powered by{' '}
              <Link to="https://github.com/Squirrel">Squirrel</Link>.
            </Feature>
            <Feature
              title="Application installers"
              src="/assets/marketing/installer.png"
              alt="Window on macOS for the WhatsApp Installer (DMG).
              Two icons are present: 'WhatsApp' and 'Applications'. The user is prompted to
              drag the WhatsApp app icon into the Applications folder."
            >
              Use{' '}
              <Link to="/docs/latest/tutorial/application-distribution">
                community-supported tooling
              </Link>{' '}
              to generate platform-specific tooling like Apple Disk Image (.dmg)
              on macOS, Windows Installer (.msi) on Windows, or RPM Package
              Manager (.rpm) on Linux.
            </Feature>
            <Feature
              title="App store distribution"
              src="/assets/marketing/app-store.png"
              alt="Mac App Store window open to the Rocket.Chat download page."
            >
              Distribute your application to more users. Electron has
              first-class support for the{' '}
              <Link to="https://www.apple.com/ca/osx/apps/app-store/index.html">
                Mac App Store
              </Link>{' '}
              (macOS), the{' '}
              <Link to="https://www.microsoft.com/en-ca/store/apps/windows">
                Microsoft Store
              </Link>{' '}
              (Windows), or the{' '}
              <Link to="https://snapcraft.io/store">Snap Store</Link> (Linux).
            </Feature>
            <Feature
              title="Crash reporting"
              src="/assets/marketing/crash-reporting.png"
              alt="Screenshot of Sentry crash reporting (https://sentry.io). Shows the error message
              ('BrowserWindow Unresponsive'), user breadcrumbs, and user information."
            >
              Automatically collect JavaScript and native crash data from your
              users with the{' '}
              <Link to="/docs/latest/api/crash-reporter">crashReporter</Link>{' '}
              module. Use a third-party service to collect this data or set up
              your own on-premise Crashpad server.
            </Feature>
          </div>
          <div className={clsx(styles.section, styles.center)}>
            <div>
              <h2>Use the tools you love</h2>
              <p className={styles.paragraphCenter}>
                With the power of modern Chromium, Electron gives you an
                unopinionated blank slate to build your app. Choose to integrate
                your favourite libraries and frameworks from the front-end
                ecosystem, or carve your own path with bespoke HTML code.
              </p>
            </div>
            <TechnologiesGrid
              list={[
                {
                  name: 'React',
                  image:
                    'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
                },
                {
                  name: 'Vue.js',
                  image:
                    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
                },
                {
                  name: 'Next.js',
                  image:
                    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
                  isMonochrome: true,
                },
                {
                  name: 'Tailwind CSS',
                  image:
                    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg',
                },
                {
                  name: 'Bootstrap',
                  image:
                    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg',
                },
                {
                  name: 'Three.js',
                  image:
                    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg',
                  isMonochrome: true,
                },
                {
                  name: 'Angular',
                  image:
                    'https://upload.wikimedia.org/wikipedia/commons/c/cf/Angular_full_color_logo.svg',
                },
                {
                  name: 'TypeScript',
                  image:
                    'https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg',
                },
                {
                  name: 'webpack',
                  image:
                    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg',
                },
                {
                  name: 'Playwright',
                  image: 'https://playwright.dev/img/playwright-logo.svg',
                },
                {
                  name: 'Testing Library',
                  image: 'https://testing-library.com/img/octopus-64x64.png',
                },
                {
                  name: 'Sass',
                  image:
                    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg',
                },
              ]}
            />
          </div>
        </div>
        <div className={styles.accentBackground}>
          <div className="container">
            <div className={clsx(styles.section)}>
              <div className={clsx(styles.explore, 'row')}>
                <div className="col margin-bottom--lg">
                  <div className="badge badge--info">
                    <span className={styles.exploreSubtext}>New!</span>
                  </div>

                  <h2>Electron Forge</h2>
                  <p>
                    Electron Forge is a batteries-included toolkit for building
                    and publishing Electron apps. Get your Electron app started
                    the right way with first-class support for JavaScript
                    bundling and an extensible module ecosystem.
                  </p>
                  <div className="button-group">
                    <Link
                      to="https://electronforge.io"
                      className="button button--electron"
                    >
                      Get started
                    </Link>
                    <Link
                      to="https://github.com/electron/forge"
                      className="button button--info"
                    >
                      Source code
                    </Link>
                  </div>
                </div>
                <div className="col">
                  <CodeWindow>
                    <span className="no-select">$ </span>npm init
                    electron-app@latest my-app
                    <span className={clsx(styles.codeComment, 'no-select')}>
                      <br />✔ Locating custom template: &quot;base&quot;
                      <br />✔ Initializing directory
                      <br />✔ Preparing template
                      <br />✔ Initializing template
                      <br />✔ Installing template dependencies
                    </span>
                  </CodeWindow>
                </div>
              </div>
              <div className={clsx(styles.explore, 'row')}>
                <div className="col margin-bottom--lg">
                  <span className={styles.exploreSubtext}>Direct download</span>
                  <h2>Installation</h2>
                  <p>
                    If you want to figure things out for yourself, you can
                    install the Electron package directly from the npm registry.
                  </p>
                  <p>
                    For a production-ready experience, install the latest stable
                    version. If you want something a bit more experimental, try
                    the prerelease or nightly channels.
                  </p>
                </div>
                <div className="col">
                  <InstallSteps />
                </div>
              </div>
              <div className={clsx(styles.explore, 'row')}>
                <div className="col margin-bottom--lg">
                  <span className={styles.exploreSubtext}>
                    Experiment with the API
                  </span>
                  <h2>Electron Fiddle</h2>
                  <p>
                    Electron Fiddle lets you create and play with small Electron
                    experiments. It greets you with a quick-start template after
                    opening — change a few things, choose the version of
                    Electron you want to run it with, and play around.
                  </p>
                  <p>
                    Save your Fiddle either as a GitHub Gist or to a local
                    folder. Once pushed to GitHub, anyone can quickly try your
                    Fiddle out by just entering it in the address bar.
                  </p>
                  <div className="button-group">
                    <Link to="/fiddle" className="button button--electron">
                      Download
                    </Link>
                    <Link
                      to="https://github.com/electron/fiddle"
                      className="button button--info"
                    >
                      Source code
                    </Link>
                  </div>
                </div>
                <div className="col">
                  <img
                    className="shadow--tl"
                    src="/assets/marketing/fiddle.png"
                    alt="Screenshot of Electron Fiddle's main window"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className={clsx(styles.section)} style={{ textAlign: 'center' }}>
            <h2>Apps users love, built with Electron</h2>
            <p>
              Thousands of organizations spanning all industries use Electron to
              build cross-platform software.
            </p>
            <AppsGrid
              list={[
                {
                  name: '1Password',
                  image: '/assets/apps/1password.svg',
                  href: 'https://1password.com/',
                },
                {
                  name: 'Asana',
                  image: '/assets/apps/asana.svg',
                  href: 'https://asana.com/',
                },
                {
                  name: 'Discord',
                  image: '/assets/apps/discord.svg',
                  href: 'https://discord.com/',
                },
                {
                  name: 'Dropbox',
                  image: '/assets/apps/dropbox.svg',
                  href: 'https://dropbox.com/',
                },
                {
                  name: 'Figma',
                  image: '/assets/apps/figma.svg',
                  href: 'https://figma.com/',
                },
                {
                  name: 'Agora Flat',
                  image: '/assets/apps/flat.svg',
                  href: 'https://flat.whiteboard.agora.io/en/',
                },
                {
                  name: 'GitHub Desktop',
                  image: '/assets/apps/github-desktop.svg',
                  href: 'https://desktop.github.com/',
                },
                {
                  name: 'itch',
                  image: '/assets/apps/itchio.svg',
                  href: 'https://itch.io/app',
                },
                {
                  name: 'Loom',
                  image: '/assets/apps/loom.svg',
                  href: 'https://www.loom.com/',
                },
                {
                  name: 'MongoDB Compass',
                  image: '/assets/apps/mongodb.svg',
                  href: 'https://www.mongodb.com/products/compass',
                },
                {
                  name: 'Notion',
                  image: '/assets/apps/notion.svg',
                  href: 'https://www.notion.so/',
                },
                {
                  name: 'Obsidian',
                  image: '/assets/apps/obsidian.svg',
                  href: 'https://obsidian.md/',
                },
                {
                  name: 'Polypane',
                  image: '/assets/apps/polypane.svg',
                  href: 'https://polypane.app/',
                },
                {
                  name: 'Postman',
                  image: '/assets/apps/postman.svg',
                  href: 'https://postman.com/',
                },
                {
                  name: 'Signal',
                  image: '/assets/apps/signal.svg',
                  href: 'https://signal.org/en/',
                },
                {
                  name: 'Skype',
                  image: '/assets/apps/skype.svg',
                  href: 'https://skype.com/',
                },
                {
                  name: 'Slack',
                  image: '/assets/apps/slack.svg',
                  href: 'https://slack.com/',
                },
                {
                  name: 'Splice',
                  image: '/assets/apps/splice.svg',
                  isMonochrome: true,
                  href: 'https://splice.com/',
                },
                {
                  name: 'Microsoft Teams',
                  image: '/assets/apps/teams.svg',
                  href: 'https://microsoft.com/en-ca/microsoft-teams/group-chat-software/',
                },
                {
                  name: 'Tidal',
                  image: '/assets/apps/tidal.svg',
                  href: 'https://tidal.com',
                  isMonochrome: true,
                },
                {
                  name: 'Trello',
                  image: '/assets/apps/trello.svg',
                  href: 'https://trello.com/',
                },
                {
                  name: 'Twitch',
                  image: '/assets/apps/twitch.svg',
                  href: 'https://www.twitch.tv/',
                },
                {
                  name: 'VS Code',
                  image: '/assets/apps/vscode.svg',
                  href: 'https://code.visualstudio.com/',
                },
                {
                  name: 'Wordpress Desktop',
                  image: '/assets/apps/wordpress.svg',
                  href: 'https://apps.wordpress.com/desktop/',
                },
              ]}
            />
          </div>
        </div>
      </main>
    </Layout>
  );
}
