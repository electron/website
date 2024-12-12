import React from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { isActiveSidebarItem } from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';
import type { Props } from '@theme/DocSidebarItem/Link';

import TagContent from './TagContent';
import styles from './styles.module.css';

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  index, // eslint-disable-line @typescript-eslint/no-unused-vars
  ...props
}: Props): JSX.Element {
  const { href, label, className, autoAddBaseUrl, customProps } = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);
  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        'menu__list-item',
        className
      )}
      key={label}
    >
      <Link
        className={clsx(
          'menu__link',
          styles.menuLink, // swizzle just this line for alignment styling
          !isInternalLink && styles.menuExternalLink,
          {
            'menu__link--active': isActive,
          }
        )}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? 'page' : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}
      >
        {label}
        {!isInternalLink && <IconExternalLink />}

        {
          // BEGIN SWIZZLED CODE
          isStringArray(customProps?.tags) && (
            <ul className={styles.tagContainer}>
              {customProps.tags.map((tag) => (
                <li
                  className={clsx('badge', styles.badge, styles[tag])}
                  key={tag}
                >
                  <TagContent platform={tag} />
                </li>
              ))}
            </ul>
          )
          // END SWIZZLED CODE
        }
      </Link>
    </li>
  );
}

function isStringArray(tags: unknown): tags is string[] {
  return Array.isArray(tags) && tags.every((tag) => typeof tag === 'string');
}
