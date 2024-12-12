import { Details } from '@docusaurus/theme-common/Details';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import * as semver from 'semver';

import {
  ApiHistory,
  PrReleaseVersions,
  PrReleaseVersionsContainer,
} from '../transformers/api-history';
import styles from './ApiHistoryTable.module.scss';

enum Change {
  ADDED = 'API ADDED',
  CHANGED = 'API CHANGED',
  DEPRECATED = 'API DEPRECATED',
}

interface ApiHistoryTableProps {
  apiHistoryJson: string;
  prReleaseVersionsJson: string;
}

function generateTableRow(
  prReleaseVersions: PrReleaseVersions | undefined,
  type: Change,
  change: NonNullable<ApiHistory[keyof ApiHistory]>[0],
) {
  const key = change['pr-url'] + '-' + type;

  // Map versions to semver syntax - use a caret unless it was released in
  // an X.0.0 release, which gets >= since every release after that has it
  const versionRanges: Array<string> = semver
    .rsort(prReleaseVersions?.backports ?? [])
    .map((version) => (version.endsWith('.0.0') ? '>=' : '^') + version);

  // Only include the main release if it wasn't backported and released in
  // an X.0.0 release. This consolidates ranges like >=30.0.0 || >=29.0.0
  // into a single >=29.0.0 since that's more intuitive for developers.
  const release = prReleaseVersions?.release;
  if (release && !versionRanges.find((version) => version.startsWith('>='))) {
    versionRanges.unshift(`>=${release}`);
  }

  const formattedVersions = versionRanges.map((version) => (
    <a
      key={version}
      href={change['pr-url']}
      target="_blank"
      rel="noopener noreferrer"
    >
      <pre>{version}</pre>
    </a>
  ));

  let changesJsx: JSX.Element | undefined;

  if ('description' in change) {
    changesJsx = (
      <ReactMarkdown
        allowedElements={['a', 'code', 'em', 'p', 'pre', 'strong']}
      >
        {change['description']}
      </ReactMarkdown>
    );
  } else {
    changesJsx = (
      <pre
        key={key}
        className={styles[type.toLowerCase().split(' ').join('-')]}
      >
        {type}
      </pre>
    );
  }

  if ('breaking-changes-header' in change) {
    changesJsx = (
      <a
        href={
          '/docs/latest/breaking-changes#' + change['breaking-changes-header']
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        {changesJsx}
      </a>
    );
  }

  return (
    <tr key={key}>
      <td>
        {formattedVersions.length !== 0 ? formattedVersions : <pre>None</pre>}
      </td>
      <td>{changesJsx}</td>
    </tr>
  );
}

const ApiHistoryTable = (props: ApiHistoryTableProps) => {
  const { apiHistoryJson, prReleaseVersionsJson } = props;

  const apiHistory = JSON.parse(apiHistoryJson) as ApiHistory;
  const prReleaseVersions = JSON.parse(
    prReleaseVersionsJson,
  ) as PrReleaseVersionsContainer;

  // ? Maybe this is too much abstraction?
  // ? Is it possible for neither the release or any of the backports for a change to be in a released stable version?
  //  In that case, there would be no point in generating a row for that change.
  const generateChangeRows = (changeType, changes) => {
    return (changes ?? []).map((change) => {
      const prNumber = Number(change['pr-url'].split('/').at(-1));
      return generateTableRow(prReleaseVersions[prNumber], changeType, change);
    });
  };

  const apiHistoryChangeRows = [
    ...generateChangeRows(Change.DEPRECATED, apiHistory.deprecated),
    ...generateChangeRows(Change.CHANGED, apiHistory.changes),
    ...generateChangeRows(Change.ADDED, apiHistory.added),
  ];

  return (
    <Details
      className={styles['api-history']}
      summary={<summary>History</summary>}
    >
      <table>
        <thead>
          <tr>
            <th>Version(s)</th>
            <th>Changes</th>
          </tr>
        </thead>
        <tbody>{apiHistoryChangeRows}</tbody>
      </table>
    </Details>
  );
};

export default ApiHistoryTable;
