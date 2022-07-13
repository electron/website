import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import React, { useState } from 'react';
import Translate from '@docusaurus/Translate';

import styles from './governance.module.scss';

/**
 * See "governance" script for _data.json generation
 */
import data from './_data.json';

export default function GovernancePage() {
  return (
    <Layout title="Governance">
      <main className="container margin-vert--xl">
        <header className={styles.header}>
          <h1>Electron Governance</h1>
          <p>
            <Translate
              id="governance.subheading"
              description="The subheading of the governance page"
            >
              The Electron governance system is comprised of Working Groups that
              oversee different aspects of the Electron ecosystem, and an
              Administrative working group that functions to resolve conflicts
              between them.
            </Translate>
          </p>
        </header>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          {data.map((group) => (
            <div
              key={group.name}
              className={clsx('col', 'col--4', styles.cardWrapper)}
            >
              <GroupCard group={group} />
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}

const GroupCard = ({ group }) => {
  // WGs have variable amount of members, so we only show the first 4
  // by default. If there are more than 4 members, we use the `showAll`
  // state to indicate if the card is expanded or not
  const hasExpand = group.members.length + 1 > 4;
  const [expanded, setExpanded] = useState(false);
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
          >
            {group.name.slice(0, 1)}
          </div>
          <div className="avatar__intro">
            <div className={clsx('avatar__name', styles.cardTitle)}>
              {group.name}
              <a className={styles.cardLink} href={group.link}>
                <img
                  src={useBaseUrl('assets/img/icon-external.svg')}
                  alt={`External link to ${group.name} README`}
                />
              </a>
            </div>
            <p className={clsx('avatar_description', styles.cardDescription)}>
              <div className={styles.cardDescriptionBody}>
                {group.description}
              </div>
            </p>
          </div>
        </div>
      </div>
      <div className="card__body">
        <p className={styles.cardSubtitle}>
          <Translate
            id="governance.members"
            description="The people that are part of a working group"
          >
            Members
          </Translate>
        </p>
        <div
          className={clsx(
            styles.cardList,
            hasExpand && (expanded ? styles.expanded : styles.unexpanded)
          )}
        >
          <Member user={group.chair} isChair />
          {group.members.map((user) => (
            <Member key={user} user={user} />
          ))}
        </div>
      </div>
      <div className="card__footer">
        <button
          className={clsx(
            'button button--outline button--block',
            !hasExpand && styles.hidden
          )}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <Translate
              id="governance.less"
              description="Label used to collapse the list of members of a working group"
            >
              See less
            </Translate>
          ) : (
            <Translate
              id="governance.more"
              description="Label used to expand the list of members of a working group"
            >
              See more
            </Translate>
          )}
        </button>
      </div>
    </div>
  );
};

const Member = ({ user, isChair }) => {
  return (
    <div className="avatar" style={{ margin: '1rem' }}>
      <img
        className="avatar__photo avatar__photo--sm"
        src={`https://github.com/${user}.png`}
        alt=""
      />
      <div
        className="avatar__intro"
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <a
          href={`https://github.com/${user}`}
          className={clsx('avatar__name', styles.memberName)}
        >
          @{user}
        </a>
        {isChair && (
          <span
            className="badge badge--secondary"
            style={{ textTransform: 'uppercase' }}
          >
            <Translate
              id="governance.chair"
              description="The current chair of a working group"
            >
              Chair
            </Translate>
          </span>
        )}
      </div>
    </div>
  );
};
