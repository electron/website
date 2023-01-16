import React, { PropsWithChildren } from 'react';
import clsx from 'clsx';
import styles from './Feature.module.scss';

interface FeatureProps {
  title: string;
  src: string;
  alt: string;
}

export default function Feature({
  title,
  src,
  alt,
  children,
}: PropsWithChildren<FeatureProps>) {
  return (
    <div className={clsx(styles.featureRow, 'row')}>
      <div className="col col--6">
        <div className={styles.featureImageContainer}>
          <img className={styles.featureImage} src={src} alt={alt} />
        </div>
      </div>
      <div className="col col--6 padding-vert--xl">
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
}
