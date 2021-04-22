//@ts-check
import React from 'react';

function LaunchButton({ url }) {
  return (
    <a
      target="_blank"
      className="button button--block button--lg button--primary"
      href={url}
    >
      Open in Fiddle
    </a>
  );
}

export default LaunchButton;
