import React from 'react';
import { Details } from '@docusaurus/theme-common/Details';
import { usePluginData } from '@docusaurus/useGlobalData';
import {
  PrReleaseVersions,
  PrReleaseVersionsPluginContent,
} from '../plugins/pr-release-versions';
import { ApiHistory } from '../transformers/api-history';
import ReactMarkdown from 'react-markdown';

enum Change {
  ADDED = 'API ADDED',
  CHANGED = 'API CHANGED',
  DEPRECATED = 'API DEPRECATED',
}

interface ApiHistoryTableProps {
  apiHistoryJson: string;
}

// TODO: Add styling based on type
function generateTableRow(
  versionsMap: PrReleaseVersionsPluginContent,
  type: Change,
  prUrl: string,
  changes?: string
) {
  const prNumber = prUrl.split('/').at(-1);

  const releaseStatus = versionsMap.get(Number(prNumber));
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
        {changes ? <ReactMarkdown>{changes}</ReactMarkdown> : <pre>{type}</pre>}
      </td>
    </tr>
  );
}

const ApiHistoryTable = (props: ApiHistoryTableProps) => {
  const { apiHistoryJson } = props;
  const versionsObject = usePluginData('pr-release-versions-plugin') as {
    [key: string]: PrReleaseVersions;
  };
  // ? This might be unnecessary
  // We had to convert the Map into an Object in the plugin to serialize it, now we convert it back.
  const versionsMap = new Map(
    Object.entries(versionsObject).map(([k, v]) => [Number(k), v])
  ) satisfies PrReleaseVersionsPluginContent;

  const apiHistory = JSON.parse(apiHistoryJson) as ApiHistory;

  // ? Maybe this is too much abstraction?
  // TODO: Sorting
  const apiHistoryChangeRows = [
    ...(apiHistory.deprecated?.map((deprecated) =>
      generateTableRow(versionsMap, Change.DEPRECATED, deprecated['pr-url'])
    ) ?? []),
    ...(apiHistory.changes?.map((change) =>
      generateTableRow(
        versionsMap,
        Change.CHANGED,
        change['pr-url'],
        change['description']
      )
    ) ?? []),
    ...(apiHistory.added?.map((added) =>
      generateTableRow(versionsMap, Change.ADDED, added['pr-url'])
    ) ?? []),
  ];

  return (
    <Details className="api-history" summary={<summary>History</summary>}>
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
