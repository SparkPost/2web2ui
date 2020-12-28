import React, { useEffect } from 'react';
import _ from 'lodash';
import { Loading } from 'src/components/loading/Loading';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import selectAccessConditionState from 'src/selectors/accessConditionState';
import { useHibana } from 'src/context/HibanaContext';
import config from 'src/config';

export function DefaultRedirect({ location, history, currentUser, ready }) {
  const [{ isHibanaEnabled }] = useHibana();
  useEffect(() => {
    const handleRedirect = () => {
      const { state: routerState = {}, ...locationWithoutState } = location;
      const allowedAccessLevels = isHibanaEnabled
        ? ['subaccount_reporting', 'heroku', 'azure']
        : ['subaccount_reporting', 'reporting', 'heroku', 'azure'];

      // if there is a redirect route set on state, we can
      // redirect there before access condition state is ready
      if (routerState.redirectAfterLogin) {
        history.replace({ ...locationWithoutState, ...routerState.redirectAfterLogin });
        return;
      }

      // if access condition state hasn't loaded, we can't
      // make a redirect decision yet
      if (!ready) {
        return;
      }

      // reporting users are all sent to the summary report
      if (_.includes(allowedAccessLevels, currentUser.access_level)) {
        history.replace({ ...location, pathname: '/reports/summary' });
        return;
      }

      // everyone else is sent to the config.splashPage route
      history.replace({ ...location, pathname: config.splashPage });
    };
    handleRedirect();
  }, [currentUser.access_level, history, isHibanaEnabled, location, ready]);

  return <Loading />;
}

const mapStateToProps = state => selectAccessConditionState(state);
export default withRouter(connect(mapStateToProps)(DefaultRedirect));
