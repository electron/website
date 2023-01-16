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
    <div>
      <div className={styles.appsContainer}>
        {list.map((item) => (
          <a
            href={item.href}
            key={item.image}
            className={clsx(styles.appCard, 'card')}
          >
            <div className="avatar card__body">
              <img
                className={clsx(
                  'avatar__photo',
                  styles.appLogo,
                  isDarkTheme && item.isMonochrome && styles.darkModeInvert
                )}
                src={item.image}
                alt={''}
              />
              <div className="avatar__intro">
                <small className="avatar__name">{item.name}</small>
              </div>
            </div>
          </a>
        ))}
      </div>
      <Link to="/apps" className="button button--electron margin-top--lg">
        See more
      </Link>
    </div>
  );
}
