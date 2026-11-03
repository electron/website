import React from 'react';
import Link from '@docusaurus/Link';
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

export default function NotFound() {
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
