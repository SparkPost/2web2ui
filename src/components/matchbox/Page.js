import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Page as OGPage } from '@sparkpost/matchbox';
import { Page as HibanaPage } from '@sparkpost/matchbox-hibana';

import { useHibana } from 'src/context/HibanaContext';
import { isAccountUiOptionSet } from 'src/helpers/conditions/account';
import { omitSystemProps } from 'src/helpers/hibana';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';
import Loading from 'src/components/loading';

export default function Page({ hibanaEmptyStateComponent: HibanaEmptyStateComponent, ...props }) {
  const [{ isHibanaEnabled }] = useHibana();
  const location = useLocation();
  const allowEmptyStates = useSelector(isAccountUiOptionSet('allow_empty_states'));
  const showHibanaEmptyState = allowEmptyStates && HibanaEmptyStateComponent && props.empty?.show;

  // IMPORTANT - props.loading needs to have a isFirstRender boolean set from the parent scope - see api-keys/ListPage.js
  React.useEffect(() => {
    if (isHibanaEnabled && showHibanaEmptyState && !props.loading) {
      segmentTrack(SEGMENT_EVENTS.EMPTY_STATE_LOADED, {
        location: location,
        // ...segmentMetaData,
      });
    }
  }, [isHibanaEnabled, location, props.loading, showHibanaEmptyState]);

  if (props.loading) return <Loading />;

  if (!isHibanaEnabled) {
    return <OGPage {...omitSystemProps(props)} />;
  }

  if (showHibanaEmptyState) {
    return <HibanaEmptyStateComponent />;
  }

  return <HibanaPage {...props} />;
}

OGPage.displayName = 'OGPage';
HibanaPage.displayName = 'HibanaPage';
