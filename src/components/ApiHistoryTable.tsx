import React from 'react';
import { Details } from '@docusaurus/theme-common/Details';
import {
  ApiHistory,
  PrReleaseVersions,
  PrReleaseVersionsContainer,
} from '../transformers/api-history';
import ReactMarkdown from 'react-markdown';

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

// TODO: Add styling based on type
function generateTableRow(
  prReleaseVersions: PrReleaseVersions | undefined,
  type: Change,
  prUrl: string,
  changes?: string
) {
  const prNumber = prUrl.split('/').at(-1);

  const allVersions: Array<string> = [];

  const release = prReleaseVersions?.release;
  if (release) allVersions.push(release);

  const backports = prReleaseVersions?.backports;
  if (backports) allVersions.push(...backports);

  // Sort by major version number e.g. 30.0.0 -> 30 in descending order i.e. 30, 29, ...
  allVersions.sort((a, b) => Number(b.split('.')[0]) - Number(a.split('.')[0]));

  const formattedVersions = allVersions.map((version, index, array) => {
    const isNotLastPortInArray = index !== array.length - 1;
    if (isNotLastPortInArray) {
      return (
        <>
          <pre key={version}>{version}</pre>
          <br></br>
        </>
      );
    }

    return <pre key={version}>{version}</pre>;
  });

  return (
    <tr>
      <td>{formattedVersions || <pre>None</pre>}</td>
      <td>
        <a href={prUrl} target="_blank" rel="noopener noreferrer">
          <pre>#{prNumber}</pre>
        </a>
      </td>
      <td>
        {/* TODO: Set allowed markdown elements */}
        {changes ? <ReactMarkdown>{changes}</ReactMarkdown> : <pre>{type}</pre>}
      </td>
    </tr>
  );
}

const ApiHistoryTable = (props: ApiHistoryTableProps) => {
  const { apiHistoryJson, prReleaseVersionsJson } = props;

  const apiHistory = JSON.parse(apiHistoryJson) as ApiHistory;
  const prReleaseVersions = JSON.parse(
    prReleaseVersionsJson
  ) as PrReleaseVersionsContainer;

  // ? Maybe this is too much abstraction?
  // ? `added` and `deprecated` go on the ends, but is there any point in sorting `changes`?
  //  How do you sort them? Given change X and change Y, X could have been merged into main before Y,
  //  but Y could have been backported to a stable version before X.
  // ? Is it possible for neither the release or any of the backports for a change to be in a released stable version?
  //  In that case, there would be no point in generating a row for that change.
  const apiHistoryChangeRows = [
    ...(apiHistory.deprecated?.map((deprecated) => {
      const prNumber = Number(deprecated['pr-url'].split('/').at(-1));
      return generateTableRow(
        prReleaseVersions[prNumber],
        Change.DEPRECATED,
        deprecated['pr-url']
      );
    }) ?? []),
    ...(apiHistory.changes?.map((change) => {
      const prNumber = Number(change['pr-url'].split('/').at(-1));
      return generateTableRow(
        prReleaseVersions[prNumber],
        Change.CHANGED,
        change['pr-url'],
        change['description']
      );
    }) ?? []),
    ...(apiHistory.added?.map((added) => {
      const prNumber = Number(added['pr-url'].split('/').at(-1));
      return generateTableRow(
        prReleaseVersions[prNumber],
        Change.ADDED,
        added['pr-url']
      );
    }) ?? []),
  ];

  return (
    <Details
      className={styles['api-history']}
      summary={<summary>History</summary>}
    >
      <table>
        <tr>
          <th>Version(s)</th>
          <th>PR</th>
          <th>Changes</th>
        </tr>
        {apiHistoryChangeRows}
      </table>
    </Details>
  );
};

export default ApiHistoryTable;