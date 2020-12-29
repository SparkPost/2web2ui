import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Page as OGPage } from '@sparkpost/matchbox';
import { Page as HibanaPage } from '@sparkpost/matchbox-hibana';

import { useHibana } from 'src/context/HibanaContext';
import { isAccountUiOptionSet } from 'src/helpers/conditions/account';
import { omitSystemProps } from 'src/helpers/hibana';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';

export default function Page({ hibanaEmptyStateComponent: HibanaEmptyStateComponent, ...props }) {
  const [{ isHibanaEnabled }] = useHibana();
  const location = useLocation();
  const allowEmptyStates = useSelector(isAccountUiOptionSet('allow_empty_states'));
  const showHibanaEmptyState = allowEmptyStates && HibanaEmptyStateComponent && props.empty?.show;

  // this is to prevent duplicates, but we still have to be careful if this component is unmounted and remounted
  React.useEffect(() => {
    if (isHibanaEnabled && showHibanaEmptyState) {
      segmentTrack(SEGMENT_EVENTS.EMPTY_STATE_LOADED, {
        location: location,
        // ...segmentMetaData,
      });
    }
  }, [isHibanaEnabled, location, showHibanaEmptyState]);

  if (!isHibanaEnabled) {
    return <OGPage {...omitSystemProps(props)} />;
  }

  if (showHibanaEmptyState) {
    return <HibanaEmptyStateComponent />;
  }

  return <HibanaPage {...props} />;
}
