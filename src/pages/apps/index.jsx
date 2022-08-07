import * as React from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';

import styles from './apps.module.scss';
import AppCard from './components/AppCard';
import { usePluginData } from '@docusaurus/useGlobalData';
import { useState } from 'react';

const filters = [
  'Developer Tools',
  'Productivity',
  'Social Networking',
  'Business',
  'Music',
  'Games',
  'Education',
  'Graphics & Design',
];

export default function AppsPage() {
  const [activeFilter, setActiveFilter] = useState(null);
  const { apps, favs } = usePluginData('apps-plugin');

  const renderFilter = (category) => {
    return (
      <li
        className={clsx(
          'pills__item',
          activeFilter === category && 'pills__item--active'
        )}
        onClick={() => setActiveFilter(category)}
      >
        {category}
      </li>
    );
  };

  return (
    <Layout title="App Showcase">
      <main className="container margin-vert--xl">
        <h1 className={styles.title}>Showcase</h1>
        <p className={styles.subtitle}>
          Discover <strong>hundreds</strong> of production applications built
          with Electron.
        </p>
        <div className={styles.filters}>
          <ul className="pills">
            <li
              className={clsx(
                'pills__item',
                activeFilter === null && 'pills__item--active'
              )}
              onClick={() => setActiveFilter(null)}
            >
              All
            </li>
            {filters.map((cat) => renderFilter(cat))}
          </ul>
        </div>
        <h2>Favorites ❤️</h2>
        <div className={clsx(styles.appCardContainer, 'margin-bottom--xl')}>
          {favs
            .filter((app) => !activeFilter || app.category === activeFilter)
            .map((app) => {
              return (
                <AppCard
                  key={app.slug}
                  name={app.name}
                  description={app.description}
                  category={app.category}
                  highlightColor={app.goodColorOnWhite}
                  logo={`https://raw.githubusercontent.com/electron/apps/master/apps/${app.slug}/${app.slug}-icon.png`}
                  isFavorite={true}
                  website={app.website}
                  repository={app.repository}
                />
              );
            })}
        </div>
        <h2>All apps</h2>
        <div className={clsx(styles.appCardContainer, 'margin-bottom--xl')}>
          {apps
            .filter((app) => !activeFilter || app.category === activeFilter)
            .map((app) => {
              return (
                <AppCard
                  key={app.slug}
                  name={app.name}
                  description={app.description}
                  category={app.category}
                  highlightColor={app.goodColorOnWhite}
                  logo={`https://raw.githubusercontent.com/electron/apps/master/apps/${app.slug}/${app.slug}-icon.png`}
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
