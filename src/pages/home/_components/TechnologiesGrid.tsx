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
    <ul className={styles.techContainer}>
      {list.map((item) => (
        <li className={styles.tech} key={item.name}>
          <img
            className={clsx(
              styles.techImage,
              isDarkTheme && item.isMonochrome && styles.darkModeInvert,
            )}
            src={item.image}
            alt=""
          />
          <span className={styles.techName}>{item.name}</span>
        </li>
      ))}
    </ul>
  );
}
