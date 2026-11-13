import React, { type PropsWithChildren } from 'react';
import styles from './Feature.module.scss';

interface FeatureProps {
  title: string;
  src: string;
  alt: string;
}

/**
 * A feature panel: the screenshot on an aura, then the title and text.
 * The homepage lays these out in a grid.
 */
export default function Feature({
  title,
  src,
  alt,
  children,
}: PropsWithChildren<FeatureProps>) {
  return (
    <article className={styles.feature}>
      <div className={styles.featureMedia}>
        <img className={styles.featureImage} src={src} alt={alt} />
      </div>
      <div className={styles.featureText}>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </article>
  );
}
