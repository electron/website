import React from 'react';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';
import clsx from 'clsx';
import styles from './AppsGrid.module.scss';
import { addUTM } from '../../../util/addUTM';

const utm = addUTM('home_page');

export default function AppsGrid({ list }) {
  const { isDarkTheme } = useColorMode();
  return (
    <div>
      <div className={styles.appsContainer}>
        {list.map((item) => (
          <a
            href={utm(item.href)}
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
      <Link
        to="https://electronjs.org/apps"
        className="button button--electron margin-top--lg"
      >
        See more
      </Link>
    </div>
  );
}
