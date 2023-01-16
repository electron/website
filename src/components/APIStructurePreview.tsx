import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import usePortal from 'react-useportal';

import styles from './APIStructurePreview.module.scss';

interface PreviewProps {
  content: string;
  title: string;
  url: string;
}

/**
 * Floating API structure preview tooltip. We dynamically inject
 * this component into the MDX docs during the compile step.
 * See /src/transformers/api-structure-previews.js for usage.
 */

function APIStructurePreview(props: PreviewProps) {
  // TODO: the react-useportal module creates 1 portal per ref even before we need
  // to even render the element. Ideally, we would have a solution that only creates
  // portals on demand and cleans them up.
  const { Portal } = usePortal();
  const linkRef = useRef(null);
  const cardRef = useRef(null);
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState(undefined);

  // Do some math: calculate the tooltip position 💯
  useEffect(() => {
    if (show) {
      // small negative offset helps retain focus so
      // we don't hit the onMouseLeave event if we
      // need to interact with the tooltip.
      const VERTICAL_OFFSET = -2;
      const offset = { x: 0, y: 0 };

      const linkRect = linkRef.current.getBoundingClientRect();
      const isBottomHalfOfPage = window.innerHeight / 2 < linkRect.y;
      const isRightHalfOfPage = window.innerWidth / 2 < linkRect.x;

      // display different offsets depending on
      // link element position on viewport
      if (isBottomHalfOfPage) {
        offset.y = cardRef.current.clientHeight + VERTICAL_OFFSET;
      } else {
        offset.y = -linkRect.height - VERTICAL_OFFSET;
      }
      if (isRightHalfOfPage) {
        offset.x = cardRef.current.clientWidth;
      } else {
        offset.x = 0;
      }

      setPosition({
        top: linkRef.current.offsetTop - offset.y,
        left: linkRef.current.offsetLeft - offset.x,
      });
    }
  }, [show]);

  const handleMouseEnter = useCallback(() => {
    setShow(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShow(false);
  }, []);

  return (
    <a
      aria-describedby="structures-tooltip" // for accessibility purposes
      href={props.url}
      ref={linkRef}
      className={styles.link}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {props.title}
      {!!show && (
        <Portal>
          <Card innerRef={cardRef} position={position} {...props} />
        </Portal>
      )}
    </a>
  );
}

interface CardProps {
  content: string;
  innerRef: React.LegacyRef<HTMLElement>;
  position: React.CSSProperties;
}

const Card = (props: CardProps) => (
  <article
    ref={props.innerRef}
    id="structures-tooltip"
    role="tooltip"
    className={clsx('alert', 'alert--info', 'shadow--md', styles.card)}
    style={props.position}
  >
    <div className="card__body">
      <ReactMarkdown allowedElements={['h1', 'ul', 'li', 'code', 'a']}>
        {props.content}
      </ReactMarkdown>
    </div>
  </article>
);

export default APIStructurePreview;
