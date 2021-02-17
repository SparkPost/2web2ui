import React, { useEffect } from 'react';
import { Page } from 'src/components/matchbox';
import { get as getDomain } from 'src/actions/sendingDomains';
import Domains from './components';
import { connect } from 'react-redux';
import { selectDomain } from 'src/selectors/sendingDomains';
import RedirectAndAlert from 'src/components/globalAlert/RedirectAndAlert';
import { Loading } from 'src/components';
import _ from 'lodash';

function VerifyBounceDomainPage(props) {
  const { domain, match, getDomain, error, sendingDomainsPending } = props;
  useEffect(() => {
    getDomain(match.params.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <RedirectAndAlert to="/domains/list/" alert={{ type: 'error', message: error.message }} />
    );
  }

  if (sendingDomainsPending) {
    return <Loading />;
  }

  return (
    <Domains.Container>
      <Page
        title="Verify Bounce Domain"
        breadcrumbAction={{
          content: 'Add Domain',
          onClick: () => props.history.push('/domains/create'),
        }}
        subtitle={domain.id}
      >
        <Domains.SetupBounceDomainSection
          title="DNS Verification"
          domain={domain}
          isBounceOnly={true}
          isSectionVisible={true}
        />
      </Page>
    </Domains.Container>
  );
}

export default connect(
  state => ({
    domain: selectDomain(state),
    sendingDomainsPending: state.sendingDomains.getLoading,
    error: state.sendingDomains.getError,
  }),
  { getDomain },
)(VerifyBounceDomainPage);
