import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';
import { usePrevious } from 'src/hooks';

export const TrackModal = ({ open, title, children }) => {
  const wasOpen = usePrevious(open);
  const location = useLocation();
  useEffect(() => {
    if (!wasOpen && open) {
      segmentTrack(SEGMENT_EVENTS.MODAL_OPENED, { title: title, location: location.pathname });
    }

    if (wasOpen && !open) {
      segmentTrack(SEGMENT_EVENTS.MODAL_CLOSED, { title: title, location: location.pathname });
    }
  }, [location.pathname, open, title, wasOpen]);

  return <>{children}</>;
};
