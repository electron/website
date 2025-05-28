import React from 'react';
import clsx from 'clsx';
import styles from './WhyCard.module.scss';

export default function WhyCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string | React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className={clsx('card', styles.whyCard)}>
      <div className="card__header">
        {icon}
        <h3 className={styles.whyCardTitle}>{title}</h3>
      </div>
      <div className="card__body">
        <p className={styles.whyCardDescription}>{description}</p>
      </div>
    </div>
  );
}
