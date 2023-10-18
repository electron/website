import React from 'react';
import Translate, { translate } from '@docusaurus/Translate';
import { PageMetadata } from '@docusaurus/theme-common';
import deadIcon from '../../static/assets/img/dead-computer-icon.webp';
import './notFound.scss';
import Layout from '@theme/Layout';
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
        <main className="container margin-vert--xl">
          <div className="row">
            <div className="col">
              <img src={deadIcon} alt="computer image"></img>
            </div>
            <div className="col col--6 col--offset-2">
              <h1 className="hero_title not_title">404</h1>
              <h1 className="hero__title not_title2">
                <Translate
                  id="theme.NotFound.title"
                  description="The title of the 404 page"
                >
                  We could not find what you were looking for.
                </Translate>
              </h1>
              <p className="not_para">
                <Translate
                  id="theme.NotFound.p1"
                  description="The first paragraph of the 404 page"
                ></Translate>
              </p>
              <p className="not_para">
                <Translate
                  id="theme.NotFound.p2"
                  description="The 2nd paragraph of the 404 page"
                >
                  Please contact the owner of the site that linked you to the
                  original URL and let them know their link is broken.
                </Translate>
              </p>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
}
