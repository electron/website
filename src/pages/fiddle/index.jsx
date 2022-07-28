import Layout from '@theme/Layout';
import React from 'react';
import styles from './fiddle.module.scss';
import FiddleLogo from '@site/static/assets/fiddle/logo.svg';

export default function FiddlePage() {
  return (
    <Layout title="Electron Fiddle">
      <header className={styles.header}>
        <FiddleLogo width={48} height={48} />
        <h1 className={styles.tagline}>
          The <em className={styles.heroEmphasis}>easiest</em> way to get
          started with Electron
        </h1>
        <div className="button-group">
          <button className="button button--info">
            Download (macOS, Intel x64)
          </button>
          <button className="button button--info">
            Download (macOS, Apple Silicon)
          </button>
        </div>
        <img
          className={styles.fiddleHeroScreenshot}
          src="/assets/fiddle/fiddle.png"
        />
      </header>
      <main className="container">
        <p>
          Electron Fiddle lets you create and play with small Electron
          experiments. It greets you with a quick-start template after opening —
          change a few things, choose the version of Electron you want to run it
          with, and play around. Then, save your Fiddle either as a GitHub Gist
          or to a local folder. Once pushed to GitHub, anyone can quickly try
          your Fiddle out by just entering it in the address bar.
        </p>
        <section>
          <h2>Explore Electron</h2>
          <p>
            Try Electron without installing any dependencies: Fiddle includes
            everything you'll need to explore the platform. It also includes
            examples for every API available in Electron, so if you want to
            quickly see what a BrowserView is or how the desktopCapturer works,
            Fiddle has got you covered.
          </p>
        </section>
        <section>
          <h2>Code with types</h2>
          <p>
            Fiddle includes Microsoft's excellent Monaco Editor, the same editor
            powering Visual Studio Code. It also installs the type definitions
            for the currently selected version of Electron automatically,
            ensuring that you always have all Electron APIs only a few
            keystrokes away.
          </p>
        </section>
        <section>
          <h2>Compile and package</h2>
          <p>
            Fiddle can automatically turn your experiment into binaries you can
            share with your friends, coworkers, or grandparents. It does so
            thanks to Electron Forge, allowing you to package your fiddle as an
            app for Windows, macOS, or Linux.
          </p>
        </section>
        <section>
          <h2>Start with Fiddle, continue wherever</h2>
          <p>
            Fiddle is not an IDE — it is however an excellent starting point.
            Once your fiddle has grown up, export it as a project with or
            without Electron Forge. Then, use your favorite editor and take on
            the world!
          </p>
        </section>
      </main>
    </Layout>
  );
}
