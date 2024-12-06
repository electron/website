import React from 'react';
import clsx from 'clsx';
import styles from './FeaturedAppsCarousel.module.scss';
import { useColorMode } from '@docusaurus/theme-common';
import type { FeaturedApp } from '../../../util/featured-apps';

interface FeaturedAppsCarouselProps {
  list: FeaturedApp[];
}

export default function FeaturedAppsCarousel({
  list,
}: FeaturedAppsCarouselProps) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';

  return (
    <div className={clsx(styles.section)}>
      <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <h2>Trusted by best-in-class apps</h2>
        <p>
          {
            'Popular consumer and rock-solid enterprise apps use Electron to power their desktop experiences.'
          }
        </p>
      </div>
      <div className={styles.carouselContainer}>
        <div className={styles.carouselTrack}>
          {/* Render list twice to create seamless loop */}
          {[...list, ...list].map((app, index) => (
            <div key={`${app.name}-${index}`} className={styles.customerLogo}>
              <img
                src={app.image}
                alt={`${app.name} logo`}
                title={app.name}
                style={{
                  height: '3rem',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: !app.isMonochrome
                    ? isDarkTheme
                      ? 'brightness(0) invert(1)'
                      : 'brightness(0)'
                    : undefined,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
