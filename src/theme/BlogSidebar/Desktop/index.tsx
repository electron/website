import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import type { Props } from '@theme/BlogSidebar/Desktop';
import styles from './styles.module.css';

const SidebarHeader = ({ title }: { title: string }) => (
  <div className={clsx(styles.sidebarHeader, 'margin-bottom--md')}>{title}</div>
);

const YearHeader = ({ year }: { year: number }) => (
  <h5 className={styles.sidebarItemTitle}>{year}</h5>
);

const SidebarItem = ({ item }: { item: Props['sidebar']['items'][number] }) => (
  <li className={styles.sidebarItem}>
    <Link
      isNavLink
      to={item.permalink}
      className={styles.sidebarItemLink}
      activeClassName={styles.sidebarItemLinkActive}
    >
      {item.title}
    </Link>
  </li>
);

export default function BlogSidebarDesktop({ sidebar }: Props) {
  let currentYear = null;

  return (
    <aside className="col col--3">
      <nav
        className={clsx(styles.sidebar, 'thin-scrollbar')}
        aria-label={translate({
          id: 'theme.blog.sidebar.navAriaLabel',
          message: 'Blog recent posts navigation',
          description: 'The ARIA label for recent posts in the blog sidebar',
        })}
      >
        <SidebarHeader title={sidebar.title} />
        <ul className={clsx(styles.sidebarItemList, 'clean-list')}>
          {sidebar.items.map((item) => {
            const itemYear = new Date(item.date).getFullYear();
            const yearHeader = currentYear !== itemYear && (
              <YearHeader key={itemYear} year={itemYear} />
            );
            currentYear = itemYear;

            return (
              <React.Fragment key={item.permalink}>
                {yearHeader}
                <SidebarItem item={item} />
              </React.Fragment>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
