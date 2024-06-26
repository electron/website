import React from 'react';
import Link from '@docusaurus/Link';
import { NavbarSecondaryMenuFiller } from '@docusaurus/theme-common';
import styles from './styles.module.css';
import clsx from 'clsx';
import type { Props } from '@theme/BlogSidebar/Mobile';

export const SidebarHeader = ({ title }: { title: string }) => (
  <div className={clsx(styles.sidebarHeader, 'margin-bottom--md')}>{title}</div>
);

export const YearHeader = ({ year }: { year: number }) => (
  <h5 className={styles.sidebarItemTitle}>{year}</h5>
);

export const SidebarItem = ({
  item,
}: {
  item: Props['sidebar']['items'][number];
}) => (
  <li className="menu__list-item">
    <Link
      isNavLink
      to={item.permalink}
      className="menu__link"
      activeClassName="menu__link--active"
    >
      {item.title}
    </Link>
  </li>
);

function BlogSidebarMobileSecondaryMenu({ sidebar }: Props) {
  let currentYear = null;

  return (
    <ul className="menu__list blog-menu__list">
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
  );
}
export default function BlogSidebarMobile(props) {
  return (
    <NavbarSecondaryMenuFiller
      component={BlogSidebarMobileSecondaryMenu}
      props={props}
    />
  );
}
