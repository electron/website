import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import clsx from 'clsx';
import styles from './TechnologiesGrid.module.scss';

interface Tech {
  image: string;
  isMonochrome?: boolean;
  name: string;
}

interface TechnologiesGridProps {
  list: Tech[];
}

export default function TechnologiesGrid({ list }: TechnologiesGridProps) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';
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
