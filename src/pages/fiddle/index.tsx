import Layout from '@theme/Layout';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  ArrowRight,
  Boxes,
  Braces,
  Compass,
  FolderOutput,
  Github,
  Package,
  Share2,
} from 'lucide-react';

import styles from './fiddle.module.scss';
import FiddleLogo from '@site/static/assets/fiddle/logo.svg';
import WindowsLogo from '@site/static/assets/img/platform-windows.svg';
import MacLogo from '@site/static/assets/img/platform-mac.svg';
import LinuxLogo from '@site/static/assets/img/platform-linux.svg';

import { usePluginData } from '@docusaurus/useGlobalData';
import type { SemVer } from 'semver';

type OS = 'win32' | 'darwin' | 'linux';

const FEATURES = [
  {
    icon: Compass,
    title: 'Explore Electron',
    image: '/assets/fiddle/explore.png',
    body: (
      <>
        Try Electron without installing any dependencies: Fiddle includes
        everything you&apos;ll need to explore the platform. It also includes
        examples for every API available in Electron, so if you want to quickly
        see what a <code>BrowserWindow</code> is or how the{' '}
        <code>desktopCapturer</code> works, Fiddle has got you covered.
      </>
    ),
  },
  {
    icon: Package,
    title: 'Use npm packages',
    image: '/assets/fiddle/npm.png',
    body: (
      <>
        If your experiment depends on third-party modules, you can search for
        any package available in the npm registry, with autocomplete and version
        selection powered by <a href="https://www.algolia.com/">Algolia</a>.
      </>
    ),
  },
  {
    icon: Braces,
    title: 'Code with types',
    image: '/assets/fiddle/types.png',
    body: (
      <>
        Fiddle is built on Microsoft&apos;s excellent{' '}
        <a href="https://microsoft.github.io/monaco-editor/">Monaco Editor</a>,
        the same editor powering VS Code. It also installs the type definitions
        for the currently selected version of Electron automatically, ensuring
        that you always have all Electron APIs only a few keystrokes away.
      </>
    ),
  },
  {
    icon: Boxes,
    title: 'Compile and package',
    image: '/assets/fiddle/package.png',
    body: (
      <>
        Fiddle can automatically turn your experiment into binaries you can
        share with your friends, coworkers, or grandparents. It does so thanks
        to <a href="https://www.electronforge.io/">Electron Forge</a>, allowing
        you to package your fiddle as an app for Windows, macOS, or Linux.
      </>
    ),
  },
  {
    icon: FolderOutput,
    title: 'Start with Fiddle, continue wherever',
    image: '/assets/fiddle/export.png',
    body: (
      <>
        Fiddle is not an IDE. However, it is an excellent starting point. Once
        your fiddle has grown up, export it as a project with or without
        Electron Forge. Then, use your favorite editor and take on the world!
      </>
    ),
  },
];

export default function FiddlePage() {
  const [OS, setOS] = useState<OS>('win32');
  const { version } = usePluginData('fiddle-versions-plugin') as SemVer;
  useEffect(() => {
    if (navigator.userAgent.indexOf('Windows') != -1) return setOS('win32');
    if (navigator.userAgent.indexOf('Mac') != -1) return setOS('darwin');
    if (navigator.userAgent.indexOf('Linux') != -1) return setOS('linux');
  }, []);

  const downloadPrefix = `https://github.com/electron/fiddle/releases/download/v${version}`;
  const downloadLinks = {
    win32: {
      ia32: `${downloadPrefix}/electron-fiddle-${version}-win32-ia32-setup.exe`,
      x64: `${downloadPrefix}/electron-fiddle-${version}-win32-x64-setup.exe`,
    },
    darwin: {
      x64: `${downloadPrefix}/Electron.Fiddle-darwin-x64-${version}.zip`,
      arm64: `${downloadPrefix}/Electron.Fiddle-darwin-arm64-${version}.zip`,
    },
    linux: {
      deb: {
        x64: `${downloadPrefix}/electron-fiddle_${version}_amd64.deb`,
        arm64: `${downloadPrefix}/electron-fiddle_${version}_arm64.deb`,
        armv7l: `${downloadPrefix}/electron-fiddle_${version}_armhf.deb`,
      },
      rpm: {
        x64: `${downloadPrefix}/electron-fiddle-${version}-1.x86_64.rpm`,
        arm64: `${downloadPrefix}/electron-fiddle-${version}-1.arm64.rpm`,
        armv7l: `${downloadPrefix}/electron-fiddle-${version}-1.armv7hl.rpm`,
      },
      AppImage: {
        x64: `${downloadPrefix}/Electron.Fiddle-${version}-x64.AppImage`,
        arm64: `${downloadPrefix}/Electron.Fiddle-${version}-arm64.AppImage`,
        armv7l: `${downloadPrefix}/Electron.Fiddle-${version}-armv7l.AppImage`,
      },
    },
  };

  // The hero offers the likeliest download for this OS, with the other
  // architecture beside it. Everything else is in the downloads panel.
  const heroDownloads: Record<
    OS,
    { primary: [string, string]; secondary: [string, string] }
  > = {
    win32: {
      primary: ['Download for Windows', downloadLinks.win32.x64],
      secondary: ['32-bit', downloadLinks.win32.ia32],
    },
    darwin: {
      primary: ['Download for macOS', downloadLinks.darwin.arm64],
      secondary: ['Intel Mac', downloadLinks.darwin.x64],
    },
    linux: {
      primary: ['Download .deb (x64)', downloadLinks.linux.deb.x64],
      secondary: ['AppImage', downloadLinks.linux.AppImage.x64],
    },
  };
  const hero = heroDownloads[OS];

  const platforms: {
    os: OS;
    name: string;
    Logo: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    formats: [string, Record<string, string>][];
  }[] = [
    {
      os: 'darwin',
      name: 'macOS',
      Logo: MacLogo,
      formats: [['.zip', downloadLinks.darwin]],
    },
    {
      os: 'win32',
      name: 'Windows',
      Logo: WindowsLogo,
      formats: [['Installer', downloadLinks.win32]],
    },
    {
      os: 'linux',
      name: 'Linux',
      Logo: LinuxLogo,
      formats: Object.entries(downloadLinks.linux).map(([format, archmap]) => [
        `.${format}`,
        archmap,
      ]),
    },
  ];

  return (
    <Layout title="Electron Fiddle">
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.appIdentity}>
            <span className={styles.appIcon}>
              <FiddleLogo width={44} height={44} aria-hidden="true" />
            </span>
            <span className={styles.appName}>
              Electron Fiddle
              <span className={styles.appVersion}>v{version}</span>
            </span>
          </div>
          <h1 className={styles.tagline}>
            The easiest way{' '}
            <span className={styles.taglineMuted}>
              to get started with Electron
            </span>
          </h1>
          <p className={styles.lead}>
            Electron Fiddle lets you create and play with small Electron
            experiments. It greets you with a runnable quick start template —
            change a few things, choose the version of Electron you want to run
            it with, and play around.
          </p>
          <div className={styles.heroActions}>
            <a
              href={hero.primary[1]}
              className="button button--primary button--lg"
            >
              {hero.primary[0]}
            </a>
            <a
              href={hero.secondary[1]}
              className="button button--secondary button--lg"
            >
              {hero.secondary[0]}
            </a>
          </div>
          <a className={styles.otherDownloads} href="#downloads">
            Other platforms and formats <ArrowRight size={14} />
          </a>
        </div>
        <div className={styles.heroShot}>
          <img
            src="/assets/fiddle/fiddle.png"
            alt="Electron Fiddle running a quick start template"
            width={3024}
            height={2024}
          />
        </div>
      </header>

      <main className={styles.sheet}>
        <section className={styles.features} aria-label="Features">
          {FEATURES.map(({ icon: Icon, title, image, body }) => (
            <article key={title} className={styles.feature}>
              <div className={styles.featureMedia}>
                <img src={image} alt="" loading="lazy" />
              </div>
              <div className={styles.featureText}>
                <h2>
                  <Icon size={16} aria-hidden="true" />
                  {title}
                </h2>
                <p>{body}</p>
              </div>
            </article>
          ))}
          <article className={styles.feature}>
            <div className={clsx(styles.featureMedia, styles.shareMedia)}>
              <div className={styles.addressBar}>
                <Share2 size={14} aria-hidden="true" />
                <span>gist.github.com/your-name/a1b2c3</span>
              </div>
            </div>
            <div className={styles.featureText}>
              <h2>
                <Share2 size={16} aria-hidden="true" />
                Share as a Gist
              </h2>
              <p>
                Save your fiddle locally or as a GitHub Gist. Once uploaded to
                GitHub, anyone can try your fiddle out by just entering the Gist
                URL in the address bar.
              </p>
            </div>
          </article>
        </section>

        <section id="downloads" className={styles.downloads}>
          <div className={styles.downloadsHeader}>
            <h2>Downloads</h2>
            <p>Version {version}, for every platform Electron supports.</p>
          </div>
          <div className={styles.platformList}>
            {platforms.map(({ os, name, Logo, formats }) => (
              <div
                key={os}
                className={clsx(
                  styles.platform,
                  os === OS && styles.platformCurrent,
                )}
              >
                <div className={styles.platformName}>
                  <Logo
                    className={styles.platformLogo}
                    width={24}
                    height={24}
                    aria-hidden="true"
                  />
                  <span>{name}</span>
                  {os === OS && (
                    <span className={styles.currentBadge}>Your platform</span>
                  )}
                </div>
                <div className={styles.formatList}>
                  {formats.map(([format, archmap]) => (
                    <div key={format} className={styles.format}>
                      <span className={styles.formatLabel}>{format}</span>
                      <div className={styles.archList}>
                        {Object.entries(archmap).map(([arch, link]) => (
                          <a
                            key={arch}
                            href={link}
                            className="button button--secondary button--sm"
                          >
                            {arch}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <a
            className={styles.sourceLink}
            href="https://github.com/electron/fiddle"
          >
            <Github size={16} aria-hidden="true" />
            Electron Fiddle on GitHub
          </a>
        </section>
      </main>
    </Layout>
  );
}
