import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Translate from '@docusaurus/Translate';

import styles from './infra.module.scss';

import data from './_data.json';

data.sort((a, b) => a.name.localeCompare(b.name));

export default function InfrastructurePage() {
  return (
    <Layout title="Infrastructure">
      <main className="container margin-vert--xl">
        <header className={styles.header}>
          <h1>Electron Infrastructure</h1>
          <p>
            <Translate
              id="infra.subheading"
              description="The subheading of the infrastructure page"
            >
              The Electron project manages and maintains a number of systems and
              services both for internal use and public consumption.
            </Translate>
          </p>
        </header>
        <div className="row">
          {data.map((app) => (
            <div
              key={app.name}
              className={clsx('col', 'col--4', styles.cardWrapper)}
            >
              <AppCard app={app} />
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}

const AppCard = ({ app }) => {
  return (
    <div className={clsx('card', styles.card)}>
      <div className="card__header">
        <div className="avatar">
          <div
            className={clsx(
              'avatar__photo',
              'avatar__photo--sm',
              styles.cardIcon
            )}
            style={{
              backgroundImage: app.avatar ? `url('${app.avatar}')` : undefined,
            }}
          >
            {app.avatar ? null : app.name.slice(0, 1)}
          </div>
          <div className="avatar__intro">
            <div className={clsx('avatar__name', styles.cardTitle)}>
              {app.name}
              {app.url ? (
                <a
                  className={styles.cardLink}
                  href={app.url}
                  target="_black"
                  rel="noopener noreferrer"
                >
                  <img
                    src={useBaseUrl('assets/img/icon-external.svg')}
                    alt={`External link to ${app.name} website`}
                  />
                </a>
              ) : null}
              <a
                className={styles.cardLink}
                href={`https://github.com/${app.repo}`}
                target="_black"
                rel="noopener noreferrer"
                style={{ marginLeft: 4 }}
              >
                <img
                  src="https://github.com/favicon.ico"
                  alt={`External link to ${app.name} repository`}
                />
              </a>
            </div>
            <p className={clsx('avatar_description', styles.cardDescription)}>
              <ReactMarkdown allowedElements={['p', 'code']}>
                {app.description}
              </ReactMarkdown>
            </p>
          </div>
        </div>
      </div>
      <div className="card__body" style={{ marginTop: 'auto' }}>
        <div className={styles.tagRow}>
          {app.tags.sort().map((tag) => {
            let image = null;
            let invertable = false;
            switch (tag.toLowerCase()) {
              case 'slack': {
                image = '/assets/img/slack_logo.png';
                break;
              }
              case 'probot': {
                image = '/assets/img/probot_logo.png';
                break;
              }
              case 'github': {
                image = 'https://github.com/favicon.ico';
                invertable = true;
                break;
              }
              case 'circleci': {
                image = '/assets/img/circleci_logo.png';
                invertable = true;
                break;
              }
            }
            return (
              <div
                className={clsx(
                  'avatar__photo',
                  'avatar__photo--sm',
                  styles.cardIcon,
                  invertable ? styles.invertable : ''
                )}
                title={tag}
                style={{
                  backgroundImage: image ? `url('${image}')` : undefined,
                }}
              >
                {image ? null : tag.slice(0, 1).toUpperCase()}
              </div>
            );
          })}
        </div>
        {/* <p className={styles.cardSubtitle}><Translate id="governance.members" description="The people that are part of a working group">Members</Translate></p> */}
        {/* <div className={clsx(styles.cardList, hasExpand && (expanded ? styles.expanded : styles.unexpanded))}>
          <Member user={app.chair} isChair/>
          { app.members.map(user => (<Member key={user} user={user}/>)) }
        </div> */}
      </div>
      <div className="card__footer" style={{ marginTop: 0 }}>
        <button
          className={clsx('button button--outline button--block')}
          // onClick={() => setExpanded(!expanded)}
        >
          <Translate
            id="infra.details"
            description="Label used to view more details about an app on the infrastructure page"
          >
            More Info
          </Translate>
        </button>
      </div>
    </div>
  );
};

// const Member = ({ user, isChair }) => {
//   return (
//     <div className="avatar" style={{ margin: '1rem' }}>
//       <img
//         className="avatar__photo avatar__photo--sm"
//         src={`https://github.com/${user}.png`}
//         alt=""
//       />
//       <div
//         className="avatar__intro"
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//         }}
//       >
//         <a
//           href={`https://github.com/${user}`}
//           className={clsx('avatar__name', styles.memberName)}
//         >
//           @{user}
//         </a>
//         {isChair && (
//           <span
//             className="badge badge--secondary"
//             style={{ textTransform: 'uppercase' }}
//           >
//             <Translate
//               id="governance.chair"
//               description="The current chair of a working group"
//             >
//               Chair
//             </Translate>
//           </span>
//         )}
//       </div>
//     </div>
//   );
// };
