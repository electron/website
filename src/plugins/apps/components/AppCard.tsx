import clsx from 'clsx';
import * as React from 'react';
import { App } from '..';

import styles from './AppCard.module.scss';

type AppCardProps = Omit<
  App,
  'date' | 'faintColorOnWhite' | 'slug' | 'highlightColor'
>;

export default function AppCard({
  name,
  description,
  category,
  logo,
  isFavorite,
  website,
  repository,
}: AppCardProps) {
  return (
    <div
      className={clsx(
        styles.appCard,
        'card shadow--md',
        isFavorite && styles.appCardFav,
      )}
    >
      <div className={styles.forceLight}>
        <div className={styles.appLogoContainer}>
          <img
            className={styles.appLogoBlurred}
            src={logo}
            alt=""
            aria-hidden="true"
          />
          <img className={styles.appLogo} src={logo} alt="" loading="lazy" />
        </div>
      </div>
      <div className="card__body">
        <p className={styles.appCategory}>{category}</p>
        <strong className={styles.appName}>{name}</strong>
        <p className={styles.appDescription}>{description}</p>
      </div>
      <div className="card__footer">
        <div className="button-group button-group--block">
          {website && (
            <a className="button button--secondary button--sm" href={website}>
              Website
            </a>
          )}
          {repository && (
            <a
              className="button button--secondary button--sm"
              href={repository}
            >
              Repo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
