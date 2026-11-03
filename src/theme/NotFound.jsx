import React, { useEffect } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate, { translate } from '@docusaurus/Translate';
import { PageMetadata } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import './notFound.scss';

const links = [
  {
    to: '/docs/latest',
    label: translate({ id: 'theme.NotFound.docs', message: 'Docs' }),
  },
  {
    to: '/docs/latest/api/app',
    label: translate({ id: 'theme.NotFound.api', message: 'API' }),
  },
  {
    to: '/search',
    label: translate({ id: 'theme.NotFound.search', message: 'Search' }),
  },
];

// The Showcase (/apps and /apps/<app>) was removed. Production is a static
// blob host with no redirect rules, so its old links land here and are sent
// to the homepage of the same locale.
const removedShowcase = /^\/(?:(de|es|fr|ja|pt|ru|zh)\/)?apps(?:\/|$)/;

export default function NotFound() {
  const home = useBaseUrl('/');
  useEffect(() => {
    // Production serves the English 404 for every path, so the locale
    // comes from the URL rather than the build.
    const match = removedShowcase.exec(window.location.pathname);
    if (match) {
      window.location.replace(match[1] ? `/${match[1]}/` : home);
    }
  }, [home]);

  return (
    <>
      <PageMetadata
        title={translate({
          id: 'theme.NotFound.title',
          message: 'Page Not Found',
        })}
      />
      <Layout>
        <main className="container notFound">
          <img
            className="notFoundMark"
            src="/assets/img/logo.svg"
            alt=""
            width="72"
            height="72"
          />
          <p className="notFoundCode">404</p>
          <h1 className="notFoundTitle">
            <Translate
              id="theme.NotFound.title"
              description="The title of the 404 page"
            >
              Page Not Found
            </Translate>
          </h1>
          <p className="notFoundText">
            <Translate
              id="theme.NotFound.p1"
              description="The first paragraph of the 404 page"
            >
              We could not find what you were looking for.
            </Translate>{' '}
            <Translate
              id="theme.NotFound.p2"
              description="The 2nd paragraph of the 404 page"
            >
              Please contact the owner of the site that linked you to the
              original URL and let them know their link is broken.
            </Translate>
          </p>
          <nav className="notFoundLinks" aria-label="Suggested pages">
            {links.map(({ to, label }, i) => (
              <Link
                key={to}
                to={to}
                className={
                  i === 0
                    ? 'button button--primary'
                    : 'button button--secondary'
                }
              >
                {label}
              </Link>
            ))}
          </nav>
        </main>
      </Layout>
    </>
  );
}
