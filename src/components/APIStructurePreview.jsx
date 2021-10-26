import clsx from 'clsx';
import React, {useRef, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import usePortal from 'react-useportal';
import useIsBrowser from '@docusaurus/useIsBrowser';

import styles from './APIStructurePreview.module.scss';

/**
 * Floating API structure preview tooltip. We dynamically inject
 * this component into the MDX docs during the compile step.
 * See /src/transformers/api-structure-previews.js for usage.
 */

function APIStructurePreview(props) {
  // TODO: the react-useportal module creates 1 portal per ref even before we need
  // to even render the element. Ideally, we would have a solution that only creates
  // portals on demand and cleans them up.
  const { Portal } = usePortal();
  const cardRef = useRef(null);
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ pageX: 0, pageY: 0, clientX: 0, clientY: 0 });
  const isBrowser = useIsBrowser();

  // * Our Card will always have `position: absolute`.
  // * It will by default have a `top` property equal to the `pageY`
  //   of cursor position.
  // * We offset this by the card height when we're on
  //   the bottom half of the viewport to make the card more
  //   visible!

  let offset = 0;
  if (isBrowser) {
    const isBottomHalfOfPage = window.innerHeight / 2 < coords.clientY;
    if (isBottomHalfOfPage && cardRef && cardRef.current) {
      offset = cardRef.current.clientHeight;
    }
  }

  const position = {top: coords.pageY - offset, left: coords.pageX}

  return (
    <a
      aria-describedby="structures-tooltip" // for accessibility purposes
      href={props.url}
      onMouseMove={(ev) => setCoords({pageX: ev.pageX, pageY: ev.pageY, clientX: ev.clientX, clientY: ev.clientY})}
      className={styles.structureLink}
      onMouseEnter={() => { setShow(true)}}
      onMouseLeave={() => { setShow(false)}}
    >
      {props.title}
      {show &&
        <Portal>
          <Card 
            innerRef={cardRef}
            position={position}
            {...props} />
        </Portal>}
    </a>
  );
}

const Card = (props) => (
  <article
    ref={props.innerRef}
    id="structures-tooltip"
    role="tooltip"
    className={clsx('alert', 'alert--info', 'shadow--md', styles.structurePreviewCard)}
    style={props.position}
  >
    <div className="card__body">
      <ReactMarkdown allowedElements={['h1', 'ul', 'li', 'code', 'a']}>{props.content}</ReactMarkdown>
    </div>
  </article>
)

export default APIStructurePreview;
