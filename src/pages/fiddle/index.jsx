import Layout from '@theme/Layout';
import React, { useEffect, useState } from 'react';
import styles from './fiddle.module.scss';
import featureStyles from '../home/_components/Feature.module.scss';
import FiddleLogo from '@site/static/assets/fiddle/logo.svg';
import WindowsLogo from '@site/static/assets/img/platform-windows.svg';
import MacLogo from '@site/static/assets/img/platform-mac.svg';
import LinuxLogo from '@site/static/assets/img/platform-linux.svg';
import clsx from 'clsx';

import { usePluginData } from '@docusaurus/useGlobalData';

export default function FiddlePage() {
  const [OS, setOS] = useState('win32');
  const version = usePluginData('fiddle-versions-plugin');
  console.log(version);
  useEffect(() => {
    if (navigator.userAgent.indexOf('Windows') != -1) return setOS('win32');
    if (navigator.userAgent.indexOf('Mac') != -1) return setOS('darwin');
    if (navigator.userAgent.indexOf('Linux') != -1) return setOS('linux');
  }, []);

  const renderDownloadButtons = () => {
    switch (OS) {
      case 'win32':
        return (
          <div className="button-group">
            <a
              href={`https://github.com/electron/fiddle/releases/download/${version.raw}/electron-fiddle-${version.version}-win32-ia32-setup.exe`}
              className={clsx('button', styles.buttonFiddle)}
            >
              Download (Windows, 32-bit)
            </a>
            <a
              href={`https://github.com/electron/fiddle/releases/download/${version.raw}/electron-fiddle-${version.version}-win32-x64-setup.exe`}
              className={clsx('button', styles.buttonFiddle)}
            >
              Download (Windows, 64-bit)
            </a>
          </div>
        );
      case 'darwin':
        return (
          <div className="button-group">
            <a
              href={`https://github.com/electron/fiddle/releases/download/${version.raw}/Electron.Fiddle-darwin-x64-${version.version}.zip`}
              className={clsx('button', styles.buttonFiddle)}
            >
              Download (macOS, Intel x64)
            </a>
            <a
              href={`https://github.com/electron/fiddle/releases/download/${version.raw}/Electron.Fiddle-darwin-arm64-${version.version}.zip`}
              className={clsx('button', styles.buttonFiddle)}
            >
              Download (macOS, Apple Silicon)
            </a>
          </div>
        );
      case 'linux':
        return (
          <React.Fragment>
            <div className="button-group margin-bottom--md">
              <a
                href={`https://github.com/electron/fiddle/releases/download/${version.raw}/electron-fiddle_${version.version}_amd64.deb`}
                className={clsx('button', styles.buttonFiddle)}
              >
                Download (.deb, x64)
              </a>
              <a
                href={`https://github.com/electron/fiddle/releases/download/${version.raw}/electron-fiddle_${version.version}_arm64.deb`}
                className={clsx('button', styles.buttonFiddle)}
              >
                Download (.deb, arm64)
              </a>
              <a
                href={`https://github.com/electron/fiddle/releases/download/${version.raw}/electron-fiddle_${version.version}_armhf.deb`}
                className={clsx('button', styles.buttonFiddle)}
              >
                Download (.deb, arm7l)
              </a>
            </div>
            <div className="button-group">
              <a
                href={`https://github.com/electron/fiddle/releases/download/${version.raw}/electron-fiddle-${version.version}-1.x86_64.rpm`}
                className={clsx('button', styles.buttonFiddle)}
              >
                Download (.rpm, x64)
              </a>
              <a
                href={`https://github.com/electron/fiddle/releases/download/${version.raw}/electron-fiddle-${version.version}-1.arm64.rpm`}
                className={clsx('button', styles.buttonFiddle)}
              >
                Download (.rpm, arm64)
              </a>
              <a
                href={`https://github.com/electron/fiddle/releases/download/${version.raw}/electron-fiddle-${version.version}-1.armv7hl.rpm`}
                className={clsx('button', styles.buttonFiddle)}
              >
                Download (.rpm, arm7l)
              </a>
            </div>
          </React.Fragment>
        );
    }
  };

  return (
    <Layout title="Electron Fiddle">
      <header className={styles.header}>
        <FiddleLogo width={48} height={48} />
        <h1 className={styles.tagline}>
          The <em className={styles.heroEmphasis}>easiest</em> way to get
          started with Electron
        </h1>
        {renderDownloadButtons()}
        <sub className={styles.otherDownloadsLink}>
          Wrong operating system? See <a href="#downloads">other downloads</a>.
        </sub>
        <img
          className={styles.fiddleHeroScreenshot}
          src="/assets/fiddle/fiddle.png"
        />
      </header>
      <main className="container">
        <p className={styles.blurb}>
          <strong>Electron Fiddle</strong> lets you create and play with small
          Electron experiments. It greets you with a runnable quick start
          template — change a few things, choose the version of Electron you
          want to run it with, and play around. Then, save your fiddle locally
          or as a GitHub Gist. Once uploaded to GitHub, anyone can try your
          fiddle out by just entering the Gist URL in the address bar.
        </p>
        <div className={clsx('row', featureStyles.featureRow)}>
          <div className="col col--6">
            <h2>Explore Electron</h2>
            <p>
              Try Electron without installing any dependencies: Fiddle includes
              everything you&apos;ll need to explore the platform. It also
              includes examples for every API available in Electron, so if you
              want to quickly see what a <code>BrowserView</code> is or how the{' '}
              <code>desktopCapturer</code> works, Fiddle has got you covered.
            </p>
          </div>
          <div className="col col--6">
            <div className={featureStyles.featureImageContainer}>
              <img
                className={featureStyles.featureImage}
                src="/assets/fiddle/explore.png"
              />
            </div>
          </div>
        </div>
        <div className={clsx('row', featureStyles.featureRow)}>
          <div className="col col--6">
            <h2>Use npm packages</h2>
            <p>
              If your experiment depends on third-party modules, you can search
              for any package available in the npm registry, with autocomplete
              and version selection powered by{' '}
              <a href="https://www.algolia.com/">Algolia</a>.
            </p>
          </div>
          <div className="col col--6">
            <div className={featureStyles.featureImageContainer}>
              <img
                className={featureStyles.featureImage}
                src="/assets/fiddle/npm.png"
              />
            </div>
          </div>
        </div>
        <div className={clsx('row', featureStyles.featureRow)}>
          <div className="col col--6">
            <h2>Code with types</h2>
            <p>
              Fiddle is built on Microsoft&apos;s excellent{' '}
              <a href="https://microsoft.github.io/monaco-editor/">
                Monaco Editor
              </a>
              , the same editor powering VS Code. It also installs the type
              definitions for the currently selected version of Electron
              automatically, ensuring that you always have all Electron APIs
              only a few keystrokes away.
            </p>
          </div>
          <div className="col col--6">
            <div className={featureStyles.featureImageContainer}>
              <img
                className={featureStyles.featureImage}
                src="/assets/fiddle/types.png"
              />
            </div>
          </div>
        </div>
        <div className={clsx('row', featureStyles.featureRow)}>
          <div className="col col--6">
            <h2>Compile and package</h2>
            <p>
              Fiddle can automatically turn your experiment into binaries you
              can share with your friends, coworkers, or grandparents. It does
              so thanks to <a href="electronforge.io">Electron Forge</a>,
              allowing you to package your fiddle as an app for Windows, macOS,
              or Linux.
            </p>
          </div>
          <div className="col col--6">
            <div className={featureStyles.featureImageContainer}>
              <img
                className={featureStyles.featureImage}
                src="/assets/fiddle/package.png"
              />
            </div>
          </div>
        </div>
        <div className={clsx('row', featureStyles.featureRow)}>
          <div className="col col--6">
            <h2>Start with Fiddle, continue wherever</h2>
            <p>
              Fiddle is not an IDE. However, it is an excellent starting point.
              Once your fiddle has grown up, export it as a project with or
              without Electron Forge. Then, use your favorite editor and take on
              the world!
            </p>
          </div>
          <div className="col col--6">
            <div className={featureStyles.featureImageContainer}>
              <img
                className={featureStyles.featureImage}
                src="/assets/fiddle/export.png"
              />
            </div>
          </div>
        </div>
        <section id="downloads" className={styles.downloadsContainer}>
          <h2>Downloads</h2>
          <div className={styles.downloadsCardsContainer}>
            <div className={clsx('card', styles.downloadsCard)}>
              <div className="card__header">
                <h3>Windows</h3>
              </div>
              <div className="card__body">
                <div className="card__image">
                  <WindowsLogo
                    className={styles.downloadOS}
                    width={96}
                    height={96}
                  />
                </div>
              </div>
              <div className={clsx('card__footer', styles.downloadsCardFooter)}>
                <div>
                  Installer{' '}
                  <div className="button-group">
                    <button className={clsx('button', styles.buttonFiddle)}>
                      x64
                    </button>
                    <button className={clsx('button', styles.buttonFiddle)}>
                      ia32
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className={clsx('card', styles.downloadsCard)}>
              <div className="card__header">
                <h3>macOS</h3>
              </div>
              <div className="card__body">
                <div className="card__image">
                  <MacLogo
                    className={styles.downloadOS}
                    width={96}
                    height={96}
                  />
                </div>
              </div>
              <div className={clsx('card__footer', styles.downloadsCardFooter)}>
                <div>
                  <code>.zip</code>{' '}
                  <div className="button-group">
                    <button className={clsx('button', styles.buttonFiddle)}>
                      Intel x64
                    </button>
                    <button className={clsx('button', styles.buttonFiddle)}>
                      Apple Silicon
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className={clsx('card', styles.downloadsCard)}>
              <div className="card__header">
                <h3>Linux</h3>
              </div>
              <div className="card__body">
                <div className="card__image">
                  <LinuxLogo
                    className={styles.downloadOS}
                    width={96}
                    height={96}
                  />
                </div>
              </div>
              <div className={clsx('card__footer', styles.downloadsCardFooter)}>
                <div>
                  <code>.rpm</code>{' '}
                  <div className="button-group">
                    <button className={clsx('button', styles.buttonFiddle)}>
                      x64
                    </button>
                    <button className={clsx('button', styles.buttonFiddle)}>
                      arm64
                    </button>
                    <button className={clsx('button', styles.buttonFiddle)}>
                      armv7
                    </button>
                  </div>
                </div>
                <div>
                  <code>.deb</code>{' '}
                  <div className="button-group">
                    <button className={clsx('button', styles.buttonFiddle)}>
                      x64
                    </button>
                    <button className={clsx('button', styles.buttonFiddle)}>
                      arm64
                    </button>
                    <button className={clsx('button', styles.buttonFiddle)}>
                      armv7
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <a
            className="button button--electron"
            href="http://github.com/electron/fiddle"
          >
            GitHub
          </a>
        </section>
      </main>
    </Layout>
  );
}
