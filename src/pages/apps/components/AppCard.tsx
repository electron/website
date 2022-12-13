import clsx from 'clsx';
import * as React from 'react';
import { App } from '../../../plugins/apps';

import styles from './AppCard.module.scss';

type AppCardProps = Omit<App, 'date' | 'faintColorOnWhite' | 'slug'>;

export default function AppCard({
  name,
  description,
  category,
  highlightColor,
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
        isFavorite && styles.appCardFav
      )}
    >
      <div className={styles.forceLight}>
        <div
          className={styles.appLogoContainer}
          style={{ background: highlightColor }}
        >
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
