import React, { useCallback, useEffect, useRef, useState } from 'react';
import usePortal from 'react-useportal';
import { toHtml } from 'hast-util-to-html';

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
  const [position, setPosition] = useState<CardPosition | undefined>(undefined);

  // Place the card above the link in the lower half of the viewport and
  // below it in the upper half, a small gap away, with a caret pointing at
  // the link. The card's ::before bridges the gap so moving the pointer onto
  // the card doesn't count as leaving the link.
  useEffect(() => {
    if (show) {
      const GAP = 10;
      const EDGE = 16;
      const CARET_INSET = 20;

      const link = linkRef.current.getBoundingClientRect();
      const card = cardRef.current.getBoundingClientRect();
      const above = window.innerHeight / 2 < link.top;
      const alignRight = window.innerWidth / 2 < link.left;

      let left = alignRight ? link.right - card.width + 12 : link.left - 12;
      left = Math.max(
        EDGE,
        Math.min(
          left,
          document.documentElement.clientWidth - card.width - EDGE,
        ),
      );
      const caret = Math.max(
        CARET_INSET,
        Math.min(link.left + link.width / 2 - left, card.width - CARET_INSET),
      );

      setPosition({
        placement: above ? 'above' : 'below',
        style: {
          top:
            window.scrollY +
            (above ? link.top - card.height - GAP : link.bottom + GAP),
          left: window.scrollX + left,
          '--preview-gap': `${GAP}px`,
          '--preview-caret': `${caret}px`,
        } as React.CSSProperties,
      });
    }
  }, [show]);

  const handleMouseEnter = useCallback(() => {
    setShow(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShow(false);
    setPosition(undefined);
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

interface CardPosition {
  placement: 'above' | 'below';
  style: React.CSSProperties;
}

interface CardProps {
  content: string;
  innerRef: React.LegacyRef<HTMLElement>;
  position: CardPosition | undefined;
}

const Card = (props: CardProps) => {
  return (
    <article
      ref={props.innerRef}
      id="structures-tooltip"
      role="tooltip"
      className={styles.card}
      data-placement={props.position?.placement}
      // Measured hidden first, then placed.
      style={props.position?.style ?? { visibility: 'hidden', top: 0, left: 0 }}
    >
      <div
        className={styles.body}
        dangerouslySetInnerHTML={{
          __html: toHtml(JSON.parse(props.content)),
        }}
      ></div>
    </article>
  );
};

export default APIStructurePreview;
