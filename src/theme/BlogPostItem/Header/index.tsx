import React, {type ReactNode} from 'react';
import Header from '@theme-original/BlogPostItem/Header';
import type HeaderType from '@theme/BlogPostItem/Header';
import type {WrapperProps} from '@docusaurus/types';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import Admonition from '@theme/Admonition';

type Props = WrapperProps<typeof HeaderType>;

export default function HeaderWrapper(props: Props): ReactNode {
  const { metadata: { date: postDate } } = useBlogPost();
  
  const postAgeInYears = Math.floor((Date.now() - new Date(postDate).getTime()) / (1000 * 60 * 60 * 24 * 365));

  const postIsOld = postAgeInYears >= 1;

  return (
    <>
      {
        postIsOld ? (
        <Admonition type="warning">
          <p>
            This blog post is over { postAgeInYears } { postAgeInYears === 1 ? 'year' : 'years' } old.
          </p>
        </Admonition>
        ) : null
      }
      <Header {...props} />
    </>
  );
}
