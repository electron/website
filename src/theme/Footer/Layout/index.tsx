import React from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss';

export default function FooterLayout({
  style,
  links,
  logo,
  copyright,
}: {
  style: string;
  links: React.ReactNode;
  logo: React.ReactNode;
  copyright: React.ReactNode;
}) {
  return (
    <footer
      className={clsx('footer', {
        'footer--dark': style === 'dark',
      })}
    >
      <div className="container container-fluid">
        {links}
        {(logo || copyright) && (
          <div className={styles.footerSplit}>
            <div className="footer__bottom text--left">
              {logo && <div className="margin-bottom--sm">{logo}</div>}
              {copyright}
            </div>
            <div className="footer__bottom text--right">
              <div className="margin-bottom--sm">
                Hosting and infrastructure graciously provided by
              </div>
              <div className={styles.logoCluster}>
                <img src="/assets/third-parties/azure.png" />
                <img
                  src="/assets/third-parties/heroku_dark.png"
                  className={styles.darkOnly}
                />
                <img
                  src="/assets/third-parties/heroku_light.png"
                  className={styles.lightOnly}
                />
                <img
                  src="/assets/third-parties/datadog_dark.png"
                  className={styles.darkOnly}
                />
                <img
                  src="/assets/third-parties/datadog_light.png"
                  className={styles.lightOnly}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
