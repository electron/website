import Layout from '@theme/Layout';
import clsx from 'clsx';
import React, { useState } from 'react';
import Translate from '@docusaurus/Translate';
import {
  ArrowUpRight,
  Boxes,
  Braces,
  ChevronDown,
  CircleArrowUp,
  HeartHandshake,
  Landmark,
  Megaphone,
  Rocket,
  Server,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

import styles from './governance.module.scss';
import type { WorkingGroup } from '../fetch-data.ts';

// One icon per working group, matched on the name from its README.
const GROUP_ICONS: [string, LucideIcon][] = [
  ['administrative', Landmark],
  ['api', Braces],
  ['community', HeartHandshake],
  ['ecosystem', Boxes],
  ['infra', Server],
  ['outreach', Megaphone],
  ['release', Rocket],
  ['security', ShieldCheck],
  ['upgrade', CircleArrowUp],
];

function iconFor(name: string): LucideIcon {
  const key = name.toLowerCase();
  return GROUP_ICONS.find(([match]) => key.startsWith(match))?.[1] ?? Users;
}

// Every card shows the same three rows of members before the list folds, so
// the cards line up. A row holds two members, or the chair alone.
const VISIBLE_SLOTS = 6;

export default function GovernancePage({
  governance,
}: {
  governance: WorkingGroup[];
}) {
  return (
    <Layout title="Governance">
      <header className={styles.hero}>
        <h1 className={styles.title}>Electron Governance</h1>
        <p className={styles.lead}>
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
      <main className={styles.sheet}>
        <div className={styles.groups}>
          {governance.map((group) => (
            <GroupCard key={group.name} group={group} />
          ))}
        </div>
      </main>
    </Layout>
  );
}

const GroupCard = ({ group }: { group: WorkingGroup }) => {
  const Icon = iconFor(group.name);
  const people = [
    ...(group.chair ? [{ user: group.chair, isChair: true }] : []),
    ...group.members.map((user) => ({ user, isChair: false })),
  ];
  const visibleCount = group.chair ? VISIBLE_SLOTS - 1 : VISIBLE_SLOTS;
  const hasExpand = people.length > visibleCount;
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? people : people.slice(0, visibleCount);

  return (
    <article className={styles.group}>
      <header className={styles.groupHeader}>
        <span className={styles.groupIcon}>
          <Icon size={18} aria-hidden="true" />
        </span>
        <div className={styles.groupHeading}>
          <h2>
            <a href={group.link}>
              {group.name}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </h2>
          <p>{group.description}</p>
        </div>
      </header>

      <div className={styles.membersLabel}>
        <Translate
          id="governance.members"
          description="The people that are part of a working group"
        >
          Members
        </Translate>
        <span className={styles.memberCount}>{people.length}</span>
      </div>
      <ul className={styles.members}>
        {shown.map(({ user, isChair }) => (
          <Member key={user} user={user} isChair={isChair} />
        ))}
      </ul>

      {/* The footer row is always there, empty when the list doesn't fold,
          so every card ends at the same line. */}
      <div className={styles.groupFooter}>
        {hasExpand && (
          <button
            type="button"
            className={styles.expand}
            aria-expanded={expanded}
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
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={clsx(expanded && styles.expandOpen)}
            />
          </button>
        )}
      </div>
    </article>
  );
};

interface MemberProps {
  user: string;
  isChair?: boolean;
}

const Member = ({ user, isChair }: MemberProps) => {
  return (
    <li>
      <a href={`https://github.com/${user}`} className={styles.member}>
        <img
          className={styles.avatar}
          src={`https://github.com/${user}.png?size=64`}
          alt=""
          width={28}
          height={28}
          loading="lazy"
        />
        <span className={styles.memberName}>@{user}</span>
        {isChair && (
          <span className={styles.chair}>
            <Translate
              id="governance.chair"
              description="The current chair of a working group"
            >
              Chair
            </Translate>
          </span>
        )}
      </a>
    </li>
  );
};
