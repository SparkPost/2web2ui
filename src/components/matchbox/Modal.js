import React, { useEffect } from 'react';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';
import { Modal as HibanaModal } from '@sparkpost/matchbox-hibana';
import { usePrevious } from 'src/hooks';

//NOTE - title prop is required for segment tracking only
const LEGACY = props => {
  const wasOpen = usePrevious(props.open);
  const { title, ...restProps } = props;
  useEffect(() => {
    if (!wasOpen && props.open) {
      segmentTrack(SEGMENT_EVENTS.MODAL_OPENED, { title: title });
    }

    if (wasOpen && !props.open) {
      segmentTrack(SEGMENT_EVENTS.MODAL_CLOSED, { title: title });
    }
  }, [props.open, title, wasOpen]);

  return <HibanaModal.LEGACY {...restProps} />;
};

function Modal(props) {
  const wasOpen = usePrevious(props.open);
  let modalTitle;
  React.Children.map(props.children, function(child) {
    if (child?.type && child.type.displayName === 'Modal.Header') {
      modalTitle = child.props.children;
    }
  });

  useEffect(() => {
    if (!wasOpen && props.open) {
      segmentTrack(SEGMENT_EVENTS.MODAL_OPENED, { title: modalTitle });
    }

    if (wasOpen && !props.open) {
      segmentTrack(SEGMENT_EVENTS.MODAL_CLOSED, { title: modalTitle });
    }
  }, [modalTitle, props.open, wasOpen]);

  return <HibanaModal {...props} />;
}

function Header(props) {
  return <HibanaModal.Header {...props} />;
}

function Content(props) {
  return <HibanaModal.Content {...props} />;
}

function Footer(props) {
  return <HibanaModal.Footer {...props} />;
}

LEGACY.displayName = 'Modal.LEGACY';
Header.displayName = 'Modal.Header';
Content.displayName = 'Modal.Content';
Footer.displayName = 'Modal.Footer';

Modal.LEGACY = LEGACY;
Modal.Header = Header;
Modal.Content = Content;
Modal.Footer = Footer;

export default Modal;
