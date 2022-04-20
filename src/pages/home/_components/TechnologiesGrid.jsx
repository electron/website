import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import clsx from 'clsx';
import styles from './TechnologiesGrid.module.scss';

export default function TechnologiesGrid({ list }) {
  const { isDarkTheme } = useColorMode();
  return (
    <div className={styles.techContainer}>
      {list.map((item) => (
        <div
          className={clsx('avatar avatar--vertical', styles.techImageWrapper)}
          key={item.name}
        >
          <img
            className={clsx(
              'avatar__photo avatar__photo--sm',
              styles.techImage,
              isDarkTheme && item.isMonochrome && styles.darkModeInvert
            )}
            src={item.image}
            alt=""
          />
          <div className="avatar__intro">
            <small className="avatar__subtitle">{item.name}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
