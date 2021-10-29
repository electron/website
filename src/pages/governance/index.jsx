import Layout from '@theme/Layout';
import clsx from 'clsx';
import React, { useState } from 'react';

import styles from './governance.module.scss';

/**
 * See "governance" script for _data.json generation
 */
import data from './_data.json';

export default function GovernancePage() {
  return (
    <Layout title="Governance">
      <div className="container margin-vert--xl">
        <header className={styles.header}>
          <h1>Electron Governance</h1>
          <p>
            The Electron governance system is comprised of <strong>Working Groups</strong> that
            oversee different aspects of the Electron ecosystem, and an Administrative working group
            that functions to resolve conflicts between them.
          </p>
        </header>
        <div className="row">
          {data.map((group) => 
          <div key={group.name} className={clsx('col', 'col--4', styles.cardWrapper)}>
            <GroupCard group={group}/>
          </div>)}
        </div>
      </div>
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
    <div className={clsx("card", styles.card)}>
      <div className="card__header">
        <div className="avatar">
          <div
            className={clsx("avatar__photo", "avatar__photo--sm", styles.cardIcon)}
          >{group.name.slice(0, 1)}</div>
          <div className="avatar__intro">
            <div className={clsx('avatar__name', styles.cardTitle)}>{group.name}</div>
            <p className={clsx('avatar_description', styles.cardDescription)}>{group.description}</p>
          </div>
        </div>
      </div>
      <div className="card__body">
        <p className={styles.cardSubtitle}>Members</p>
        <div className={clsx(styles.cardList, hasExpand && (expanded ? styles.expanded : styles.unexpanded))}>
          <Member user={group.chair} isChair/>
          { group.members.map(user => (<Member user={user}/>)) }
        </div>
      </div>
      {/** Only show this button if needed. Apply visibility:hidden so it takes up the same height. */}
      <button className={clsx("button", styles.buttonSubtle, !hasExpand && styles.hidden)}
        type="button"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▲' : '▼'}
      </button>
      <div className="card__footer">
        <button className="button button--outline button--block" type="button">GitHub</button>
      </div>
    </div>
  )
};

const Member = ({ user, isChair }) => {
  return (
    <div className="avatar" style={{margin: '1rem'}}>
      <img
        className="avatar__photo avatar__photo--sm"
        src={`https://github.com/${user}.png`}
      />
      <div className="avatar__intro" style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <a href={`https://github.com/${user}`} className={clsx('avatar__name', styles.memberName)}>@{user}</a>
        {isChair && <span className="badge badge--secondary" style={{textTransform: 'uppercase'}}>Chair</span>}
      </div>
    </div>
  )
}
