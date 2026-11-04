import React from 'react';
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
    <article className={styles.whyCard}>
      <span className={styles.whyCardIcon} aria-hidden="true">
        {icon}
      </span>
      <h3 className={styles.whyCardTitle}>{title}</h3>
      <p className={styles.whyCardDescription}>{description}</p>
    </article>
  );
}
