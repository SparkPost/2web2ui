import React, { useEffect } from 'react';
import { useHibana } from 'src/context/HibanaContext';
import { omitSystemProps } from 'src/helpers/hibana';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';
import { Modal as MBModal } from '@sparkpost/matchbox';
import { Modal as HibanaModal } from '@sparkpost/matchbox-hibana';
import { usePrevious } from 'src/hooks';
import Portal from './Portal';

const ERROR_MESSAGE =
  'Modal components can only be used with Hibana enabled. To use a Modal component in both themes, please use Modal.LEGACY';

function OGModal({ children, ...rest }) {
  return (
    <Portal containerId="modal-portal">
      <MBModal {...rest}>{children}</MBModal>
    </Portal>
  );
}

const LEGACY = props => {
  const [{ isHibanaEnabled }] = useHibana();
  const wasOpen = usePrevious(props.open);

  useEffect(() => {
    if (!wasOpen && props.open) {
      segmentTrack(SEGMENT_EVENTS.MODAL_OPENED, { title: props.title });
    }

    if (wasOpen && !props.open) {
      segmentTrack(SEGMENT_EVENTS.MODAL_CLOSED, { title: props.title });
    }
  }, [props.open, props.title, wasOpen]);

  if (!isHibanaEnabled) {
    return <OGModal {...omitSystemProps(props)} />;
  }

  return <HibanaModal.LEGACY {...props} />;
};

function Modal(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;
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

  if (!isHibanaEnabled) throw new Error(ERROR_MESSAGE);

  return <HibanaModal {...props} />;
}

function Header(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  if (!isHibanaEnabled) throw new Error(ERROR_MESSAGE);

  return <HibanaModal.Header {...props} />;
}

function Content(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  if (!isHibanaEnabled) throw new Error(ERROR_MESSAGE);

  return <HibanaModal.Content {...props} />;
}

function Footer(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  if (!isHibanaEnabled) throw new Error(ERROR_MESSAGE);

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
