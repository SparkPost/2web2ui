import React, { createContext, useContext } from 'react';
import { connect } from 'react-redux';
import { updateUserUIOptions } from 'src/actions/currentUser';
import { showAlert } from 'src/actions/globalAlert';
import { isUserUiOptionSet } from 'src/helpers/conditions/user';
import { selectCondition } from 'src/selectors/accessConditionState';
import { segmentTrack, SEGMENT_EVENTS } from '../helpers/segment';

export const HibanaStateContext = createContext();

function Provider(props) {
  const { children, ...rest } = props;

  return <HibanaStateContext.Provider value={rest}>{children}</HibanaStateContext.Provider>;
}

function mapStateToProps(state) {
  return {
    isCurrentUserPending: state.currentUser.loading,
    isHibanaEnabled: true,
    isBannerVisible: selectCondition(isUserUiOptionSet('isHibanaBannerVisible'))(state),
  };
}

const mapDispatchToProps = {
  dismissBanner: () => updateUserUIOptions({ isHibanaBannerVisible: false }),
  setIsHibanaEnabled: bool => {
    if (bool) {
      segmentTrack(SEGMENT_EVENTS.HIBANA_TOGGLED_ON);
    } else {
      segmentTrack(SEGMENT_EVENTS.HIBANA_TOGGLED_OFF);
    }

    // Always dismiss the banner when the user toggles their theme
    return updateUserUIOptions({ isHibanaEnabled: bool, isHibanaBannerVisible: false });
  },
  showAlert,
};

export const HibanaProvider = connect(mapStateToProps, mapDispatchToProps)(Provider);

export function useHibana() {
  const context = useContext(HibanaStateContext);
  if (context === undefined) throw new Error('useHibana must be used within a HibanaProvider');

  return [context];
}
