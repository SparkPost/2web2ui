import React, { useEffect } from 'react';
import qs from 'query-string';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { login } from 'src/actions/auth';
import { DEFAULT_REDIRECT_ROUTE, AUTH_ROUTE } from 'src/constants';

export function SSOPage(props) {
  useEffect(() => {
    const params = qs.parse(props.location.search);

    const token = params.ad || params.token; // 'token' for azure, 'ad' for saml/heroku

    try {
      const data = JSON.parse(atob(token));

      if (data.accessToken && data.username) {
        props.login({
          authData: {
            access_token: data.accessToken,
            username: data.username,
            refresh_token: '',
          },
          saveCookie: true,
        });

        return props.history.push(DEFAULT_REDIRECT_ROUTE);
      } else {
        return props.history.push(AUTH_ROUTE);
      }
    } catch (e) {
      // something went wrong while parsing
      return props.history.push(AUTH_ROUTE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}

export default withRouter(connect(null, { login })(SSOPage));
