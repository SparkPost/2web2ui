import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import qs from 'query-string';
import cookie from 'js-cookie';
import _ from 'lodash';
import { CenteredLogo } from 'src/components';
import { BottomPad } from 'src/components/hibana';
import { PageLink } from 'src/components/links';
import { Error, Panel, Stack } from 'src/components/matchbox';
import JoinForm from './components/JoinForm';
import JoinError from './components/JoinError';
import SignUpTabs from './components/SignUpTabs';
import { inSPCEU } from 'src/config/tenant';
import { authenticate } from 'src/actions/auth';
import { get as getCurrentUser, updateUserUIOptions } from 'src/actions/currentUser';
import { register } from 'src/actions/account';
import getConfig from 'src/helpers/getConfig';
import { loadScript } from 'src/helpers/loadScript';
import * as analytics from 'src/helpers/analytics';
import {
  AFTER_JOIN_REDIRECT_ROUTE,
  RV_AFTER_JOIN_REDIRECT_ROUTE,
  LINKS,
  AWS_COOKIE_NAME,
  ANALYTICS_CREATE_ACCOUNT,
  CROSS_LINK_MAP,
} from 'src/constants';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';

export class JoinPage extends Component {
  state = {
    formData: {},
  };

  extractQueryParams = () => {
    const {
      params: { video, ...restParams },
    } = this.props;
    const existingCookie = cookie.getJSON(getConfig('attribution.cookieName')) || {};

    const allData = { ...existingCookie, ...restParams };

    return {
      sfdcid: allData.sfdcid,
      attributionData: _.pick(allData, getConfig('salesforceDataParams')),
      creationParams: allData,
      video,
    };
  };

  registerSubmit = values => {
    this.setState({ formData: values });
    const {
      params: { plan, product },
      register,
      authenticate,
    } = this.props;
    const {
      sfdcid,
      attributionData,
      creationParams,
      video: sawVideoWhileSignUp,
    } = this.extractQueryParams();

    const accountFields = _.omit(values, 'email_opt_in');
    const signupData = {
      ...accountFields,
      sfdcid,
      salesforce_data: { ...attributionData, email_opt_out: !values.email_opt_in },
      creation_params: { ...creationParams, email_opt_in: Boolean(values.email_opt_in) },
    };

    return register(signupData)
      .then(accountData => {
        analytics.setVariable('username', accountData.username);
        analytics.trackFormSuccess(ANALYTICS_CREATE_ACCOUNT, {
          form_type: ANALYTICS_CREATE_ACCOUNT,
        });
        segmentTrack(SEGMENT_EVENTS.ACCOUNT_CREATED);
        return authenticate(accountData.username, values.password);
      })
      .then(() => {
        this.props.getCurrentUser().then(() => {
          this.props.updateUserUIOptions({ sawVideoWhileSignUp });
        });

        if (product === 'rv') {
          return this.props.history.push(RV_AFTER_JOIN_REDIRECT_ROUTE);
        }

        return this.props.history.push(AFTER_JOIN_REDIRECT_ROUTE, { plan });
      });
  };

  render() {
    const { createError } = this.props.account;
    const { formData } = this.state;
    const brand = CROSS_LINK_MAP[getConfig('crossLinkTenant')];

    return (
      <div>
        {loadScript({ url: LINKS.RECAPTCHA_LIB_URL })}
        <CenteredLogo showAwsLogo={this.props.isAWSsignUp} />
        <Panel.LEGACY>
          {brand && (
            <SignUpTabs brand={brand} isSPCEU={this.props.isSPCEU} location={this.props.location} />
          )}
          <Panel.LEGACY.Section>
            <Stack>
              <h3>Sign Up for SparkPost{this.props.isSPCEU ? ' EU' : ''}</h3>
              {createError && (
                <BottomPad>
                  <Error error={<JoinError errors={createError} data={formData} />} />
                </BottomPad>
              )}
              <JoinForm onSubmit={this.registerSubmit} />
            </Stack>
          </Panel.LEGACY.Section>
        </Panel.LEGACY>
        <Panel.LEGACY.Footer
          left={
            <small>
              Already have an account? <PageLink to="/auth">Log In</PageLink>.
            </small>
          }
        />
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    account: state.account,
    params: qs.parse(props.location.search),
    isAWSsignUp: !!cookie.get(AWS_COOKIE_NAME),
    isSPCEU: inSPCEU(),
  };
}

export default withRouter(
  connect(mapStateToProps, { authenticate, register, getCurrentUser, updateUserUIOptions })(
    JoinPage,
  ),
);
