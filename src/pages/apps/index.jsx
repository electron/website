import * as React from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';

import styles from './apps.module.scss';
import AppCard from './components/AppCard';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useState } from 'react';

export default function AppsPage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const { apps, categories } = usePluginData('apps-plugin');

  const filters = Object.entries(categories);

  const renderPillFilter = (filter) => {
    const [name, entries] = filter;
    return (
      <li
        key={name}
        className={clsx(
          'pills__item',
          styles.pillFilter,
          activeCategory && activeCategory[0] === name && 'pills__item--active'
        )}
        onClick={() => setActiveCategory(filter)}
      >
        <span>{name}</span>
        <span className={clsx('badge badge--secondary', styles.filterBadge)}>
          {entries.length}
        </span>
      </li>
    );
  };

  const renderDropdownFilter = (filter) => {
    const [name, entries] = filter;
    return (
      <li
        key={name}
        className={clsx(
          'dropdown__link',
          styles.dropdownFilterItem,
          Array.isArray(activeCategory) &&
            activeCategory[0] === name &&
            'dropdown__link--active'
        )}
        style={{ display: 'flex', justifyContent: 'space-between' }}
        onClick={() => setActiveCategory(filter)}
      >
        <span>{name}</span>
        <span className={clsx('badge badge--secondary', styles.filterBadge)}>
          {entries.length}
        </span>
      </li>
    );
  };

  const currentFavs = activeCategory
    ? activeCategory[1].filter((app) => app.isFavorite)
    : apps.filter((app) => app.isFavorite);

  return (
    <Layout title="App Showcase">
      <main className="container margin-vert--xl">
        <h1 className={styles.title}>Showcase</h1>
        <p className={styles.subtitle}>
          Discover <strong>hundreds of production applications</strong> built
          with Electron.
        </p>
        <div
          className={clsx(
            'margin-bottom--xl',
            'shadow--tl',
            styles.pillFiltersContainer
          )}
        >
          <ul className={clsx('pills', styles.pillFiltersList)}>
            <li
              className={clsx(
                'pills__item',
                styles.pillFilter,
                activeCategory === null && 'pills__item--active'
              )}
              onClick={() => setActiveCategory(null)}
            >
              All
            </li>
            {filters
              .sort((a, b) => b[1].length - a[1].length)
              .map((cat) => renderPillFilter(cat))}
          </ul>
          <ul
            className={clsx(
              'dropdown dropdown--hoverable',
              styles.dropdownFilter
            )}
          >
            <button className="button button--electron button--block">
              {Array.isArray(activeCategory) ? activeCategory[0] : 'All'}
            </button>
            <ul className={clsx('dropdown__menu', styles.dropdownMenu)}>
              <li
                className={clsx(
                  'dropdown__link',
                  styles.dropdownFilterItem,
                  activeCategory === null && 'dropdown__link--active'
                )}
                onClick={() => setActiveCategory(null)}
              >
                All
              </li>
              {filters
                .sort((a, b) => b[1].length - a[1].length)
                .map((cat) => renderDropdownFilter(cat))}
            </ul>
          </ul>
        </div>
        {currentFavs.length > 0 && (
          <div
            className={clsx(
              styles.favsContainer,
              'shadow--tl',
              'margin-bottom--xl'
            )}
          >
            <h2 className={styles.sectionHeader}>Favorites ❤️</h2>
            <div className={clsx(styles.appCardContainer)}>
              {currentFavs.map((app) => {
                return (
                  <AppCard
                    key={app.slug}
                    name={app.name}
                    description={app.description}
                    category={app.category}
                    highlightColor={app.faintColorOnWhite}
                    logo={`https://raw.githubusercontent.com/erickzhao/apps/master/apps/${app.slug}/${app.slug}-icon-128.png`}
                    isFavorite={true}
                    website={app.website}
                    repository={app.repository}
                  />
                );
              })}
            </div>
          </div>
        )}
        <div
          className={clsx(
            styles.appCardContainer,
            styles.allContainer,
            'margin-bottom--xl'
          )}
        >
          {apps
            .filter(
              (app) => !activeCategory || app.category === activeCategory[0]
            )
            .map((app) => {
              return (
                <AppCard
                  key={app.slug}
                  name={app.name}
                  description={app.description}
                  category={app.category}
                  highlightColor={app.faintColorOnWhite}
                  logo={`https://raw.githubusercontent.com/erickzhao/apps/master/apps/${app.slug}/${app.slug}-icon-128.png`}
                  isFavorite={app.isFavorite}
                  website={app.website}
                  repository={app.repository}
                />
              );
            })}
        </div>
      </main>
    </Layout>
  );
}
