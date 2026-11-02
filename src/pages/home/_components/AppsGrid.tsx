import React from 'react';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';
import clsx from 'clsx';
import styles from './AppsGrid.module.scss';

interface App {
  href: string;
  image: string;
  isMonochrome?: boolean;
  name: string;
}

interface AppsGridProps {
  list: App[];
}

export default function AppsGrid({ list }: AppsGridProps) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';
  return (
    <div className={styles.apps}>
      <ul className={styles.appsContainer}>
        {list.map((item) => (
          <li key={item.image}>
            <a href={item.href} className={styles.appCard}>
              <span className={styles.appIcon}>
                <img
                  className={clsx(
                    styles.appLogo,
                    isDarkTheme && item.isMonochrome && styles.darkModeInvert,
                  )}
                  src={item.image}
                  alt=""
                  loading="lazy"
                />
              </span>
              <span className={styles.appName}>{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
      <Link to="/apps" className="button button--secondary">
        See more
      </Link>
    </div>
  );
}
