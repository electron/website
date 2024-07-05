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
  prReleaseVersions: PrReleaseVersionsContainer,
  type: Change,
  prUrl: string,
  changes?: string
) {
  const prNumber = prUrl.split('/').at(-1);

  const releaseStatus = prReleaseVersions[Number(prNumber)];
  // TODO: Sorting
  const allVersions = [
    releaseStatus?.release,
    ...(releaseStatus?.backports ?? []),
  ];

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
  const prReleaseVersions = JSON.parse(prReleaseVersionsJson) as {
    [key: string]: PrReleaseVersions;
  };

  // ? Maybe this is too much abstraction?
  // TODO: Sorting
  const apiHistoryChangeRows = [
    ...(apiHistory.deprecated?.map((deprecated) =>
      generateTableRow(
        prReleaseVersions,
        Change.DEPRECATED,
        deprecated['pr-url']
      )
    ) ?? []),
    ...(apiHistory.changes?.map((change) =>
      generateTableRow(
        prReleaseVersions,
        Change.CHANGED,
        change['pr-url'],
        change['description']
      )
    ) ?? []),
    ...(apiHistory.added?.map((added) =>
      generateTableRow(prReleaseVersions, Change.ADDED, added['pr-url'])
    ) ?? []),
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
