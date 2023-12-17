import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

interface ESMCodeBlockProps {
  cjs: string;
  mjs: string;
}

const ESMCodeBlock = (props: ESMCodeBlockProps) => {
  const { cjs, mjs } = props;

  const tabValues = [
    { label: 'CJS', value: 'cjs', content: cjs },
    { label: 'ESM', value: 'mjs', content: mjs },
  ];
  return (
    <Tabs values={tabValues}>
      {tabValues.map(({ content, value }) => {
        return (
          <TabItem value={value} key={value}>
            <CodeBlock className={`language-${value}`}>{content}</CodeBlock>
          </TabItem>
        );
      })}
    </Tabs>
  );
};

export default ESMCodeBlock;
