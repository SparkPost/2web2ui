import React, { useEffect } from 'react';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';
import { usePrevious } from 'src/hooks';

export const TrackModal = ({ open, title, children }) => {
  const wasOpen = usePrevious(open);
  useEffect(() => {
    if (!wasOpen && open) {
      segmentTrack(SEGMENT_EVENTS.MODAL_OPENED, { title: title });
    }

    if (wasOpen && !open) {
      segmentTrack(SEGMENT_EVENTS.MODAL_CLOSED, { title: title });
    }
  }, [open, title, wasOpen]);

  return <>{children}</>;
};
