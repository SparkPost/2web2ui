import React from 'react';
import { CheckCircleOutline } from '@sparkpost/matchbox-icons';
import { Button } from 'src/components/matchbox';
import { ButtonLink } from 'src/components/links';

const SaveAndPublish = props => {
  const { onClick, className, children } = props;

  return (
    <div className={className}>
      {children && (
        <Button variant="secondary" onClick={onClick} data-id="action-save-and-publish">
          {children}
        </Button>
      )}

      {!children && (
        <ButtonLink onClick={onClick} data-id="action-save-and-publish">
          <CheckCircleOutline />

          <span>Save and Publish</span>
        </ButtonLink>
      )}
    </div>
  );
};

export default SaveAndPublish;
