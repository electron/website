import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';
import type { Props } from '@theme/BlogPostItem';

// apply a bottom margin in list view
function useContainerClassName() {
  const { isBlogPostPage } = useBlogPost();
  return !isBlogPostPage ? 'margin-bottom--xl' : undefined;
}

export default function BlogPostItem({
  children,
  className,
}: Props): ReactNode {
  const containerClassName = useContainerClassName();
  const { metadata } = useBlogPost();
  const blogDate = new Date(metadata.date); // Date on which blog was posted
  const currentDate = new Date();
  const blogAge =
    (currentDate.getTime() - blogDate.getTime()) / (1000 * 60 * 60 * 24 * 365); // converting time in miliseconds to year
  const isOld = blogAge >= 1;
  const yearLabel = Math.floor(blogAge) === 1 ? 'year' : 'years'; // grammer check
  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      {isOld && (
        <div className="warning">
          ⚠️ <strong>Note:</strong> This blog post is over{' '}
          <strong>
            {' '}
            {Math.floor(blogAge)} {yearLabel} old{' '}
          </strong>
          . Some information may be outdated.
        </div>
      )}
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
    </BlogPostItemContainer>
  );
}
