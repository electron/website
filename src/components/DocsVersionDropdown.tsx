/**
 * Navbar dropdown listing the available docs versions.
 *
 * Each docs version is a separate static build (`/docs/latest`, `/docs/dev`,
 * `/docs/vX.Y.Z`), so the list is fetched at runtime from
 * https://www.electronjs.org/docs/versions.json and every entry is a plain
 * link (full page load) to the same page path in the chosen version.
 * `/docs/next/` is an alias the CDN redirects to the newest prerelease.
 *
 * Registered as the `custom-electronDocsVersionDropdown` navbar item type in
 * `src/theme/NavbarItem/ComponentTypes.tsx`.
 */
import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Collapsible, useCollapsible } from '@docusaurus/theme-common';

import {
  LATEST_VERSION,
  WEBSITE_ORIGIN,
  docsVersionUrl,
  parseDocsVersionPath,
} from '../util/docs-version.ts';
import {
  buildDocsVersionEntries,
  isEntryForVersion,
  type DocsVersionEntry,
  type DocsVersionsJson,
} from '../util/docs-versions-list.ts';
import styles from './DocsVersionDropdown.module.scss';

const VERSIONS_JSON_URL = `${WEBSITE_ORIGIN}/docs/versions.json`;

interface DocsVersionDropdownProps {
  mobile?: boolean;
  position?: 'left' | 'right';
  className?: string;
}

function useCurrentDocsVersion(): string {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();
  return String(customFields?.electronDocsVersion ?? LATEST_VERSION);
}

function useDocsVersions(currentVersion: string): DocsVersionEntry[] | null {
  const [entries, setEntries] = useState<DocsVersionEntry[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(VERSIONS_JSON_URL, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((data: DocsVersionsJson | undefined) => {
        if (data && typeof data === 'object' && Array.isArray(data.versions)) {
          setEntries(buildDocsVersionEntries(data, currentVersion));
        } else if (currentVersion !== LATEST_VERSION) {
          setEntries([{ version: LATEST_VERSION, label: 'latest' }]);
        }
      })
      .catch(() => {
        // Versions are a nice-to-have: without them the dropdown only
        // offers the way back to the latest docs (or nothing, on latest).
        if (currentVersion !== LATEST_VERSION) {
          setEntries([{ version: LATEST_VERSION, label: 'latest' }]);
        }
      });

    return () => controller.abort();
  }, [currentVersion]);

  return entries;
}

interface VersionLinkProps {
  entry: DocsVersionEntry;
  currentVersion: string;
  pathname: string;
  className: string;
  activeClassName: string;
}

function VersionLink({
  entry,
  currentVersion,
  pathname,
  className,
  activeClassName,
}: VersionLinkProps) {
  const isActive = isEntryForVersion(entry, currentVersion);
  return (
    <li>
      <a
        className={clsx(className, isActive && activeClassName)}
        href={docsVersionUrl(pathname, entry.version)}
        aria-current={isActive ? 'page' : undefined}
      >
        {entry.label}
      </a>
    </li>
  );
}

function DesktopDropdown({
  label,
  entries,
  currentVersion,
  pathname,
  position,
  className,
}: {
  label: string;
  entries: DocsVersionEntry[];
  currentVersion: string;
  pathname: string;
  position?: 'left' | 'right';
  className?: string;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        !dropdownRef.current ||
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }
      setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('focusin', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('focusin', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={clsx('navbar__item', 'dropdown', 'dropdown--hoverable', {
        'dropdown--right': position === 'right',
        'dropdown--show': showDropdown,
      })}
    >
      <a
        href="#"
        role="button"
        aria-haspopup="true"
        aria-expanded={showDropdown}
        className={clsx('navbar__link', styles.trigger, className)}
        onClick={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowDropdown(!showDropdown);
          }
        }}
      >
        {label}
      </a>
      <ul className={clsx('dropdown__menu', styles.menu)}>
        {entries.map((entry) => (
          <VersionLink
            key={entry.version}
            entry={entry}
            currentVersion={currentVersion}
            pathname={pathname}
            className="dropdown__link"
            activeClassName="dropdown__link--active"
          />
        ))}
      </ul>
    </div>
  );
}

function MobileDropdown({
  label,
  entries,
  currentVersion,
  pathname,
  className,
}: {
  label: string;
  entries: DocsVersionEntry[];
  currentVersion: string;
  pathname: string;
  className?: string;
}) {
  const { collapsed, toggleCollapsed } = useCollapsible({
    initialState: true,
  });

  return (
    <li
      className={clsx('menu__list-item', {
        'menu__list-item--collapsed': collapsed,
      })}
    >
      <div className="menu__list-item-collapsible">
        <a
          href="#"
          role="button"
          className={clsx('menu__link menu__link--sublist', className)}
          onClick={(e) => {
            e.preventDefault();
            toggleCollapsed();
          }}
        >
          {label}
        </a>
        <button
          aria-label={
            collapsed ? 'Expand the dropdown' : 'Collapse the dropdown'
          }
          aria-expanded={!collapsed}
          type="button"
          className="clean-btn menu__caret"
          onClick={toggleCollapsed}
        />
      </div>
      <Collapsible lazy as="ul" className="menu__list" collapsed={collapsed}>
        {entries.map((entry) => (
          <VersionLink
            key={entry.version}
            entry={entry}
            currentVersion={currentVersion}
            pathname={pathname}
            className="menu__link"
            activeClassName="menu__link--active"
          />
        ))}
      </Collapsible>
    </li>
  );
}

export default function DocsVersionDropdown({
  mobile = false,
  position,
  className,
}: DocsVersionDropdownProps) {
  const currentVersion = useCurrentDocsVersion();
  const { pathname } = useLocation();
  const entries = useDocsVersions(currentVersion);

  // Only meaningful on docs pages
  if (!parseDocsVersionPath(pathname)) {
    return null;
  }

  // Nothing to switch to (yet): on `latest` the list only comes from the
  // network, so render nothing rather than an empty menu.
  if (!entries || entries.length === 0) {
    return null;
  }

  const current = entries.find((entry) =>
    isEntryForVersion(entry, currentVersion),
  );
  const label = `Version: ${current?.label ?? currentVersion}`;

  const props = { label, entries, currentVersion, pathname, className };

  return mobile ? (
    <MobileDropdown {...props} />
  ) : (
    <DesktopDropdown {...props} position={position} />
  );
}
