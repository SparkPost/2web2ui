import React from 'react';
import { Modal as HibanaModal } from '@sparkpost/matchbox-hibana';
import { TrackModal } from 'src/components/tracking/TrackModal';

//NOTE - title prop is required for segment tracking only
const LEGACY = props => {
  const { title, ...restProps } = props;

  return (
    <TrackModal open={props.open} title={title}>
      <HibanaModal.LEGACY {...restProps} />
    </TrackModal>
  );
};

function Modal(props) {
  let modalTitle = '';
  React.Children.map(props.children, function(child) {
    if (child?.type && child.type.displayName === 'Modal.Header') {
      modalTitle = child.props.children;
    }
  });

  if (Boolean(modalTitle)) {
    // eslint-disable-next-line
    console.warn(
      'This modal will not be tracked with a correct name. Please use `Modal.Header` along with `ScreenReaderOnly` to avoid this problem',
    );
  }

  return (
    <TrackModal open={props.open} title={modalTitle}>
      <HibanaModal {...props} />
    </TrackModal>
  );
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
