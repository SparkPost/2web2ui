import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { create as createDomain } from 'src/actions/sendingDomains';
import { showAlert } from 'src/actions/globalAlert';
import { PageLink } from 'src/components/links';
import { Page, Panel } from 'src/components/matchbox';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';
import CreateForm from './components/CreateForm';

export class CreatePage extends Component {
  handleCreate = values => {
    const { createDomain, history } = this.props;

    return createDomain(values).then(() => {
      history.push(`/account/sending-domains/edit/${values.domain}`, {
        triggerGuide: this.props.location?.state?.triggerGuide,
      });
      segmentTrack(SEGMENT_EVENTS.SENDING_DOMAIN_ADDED);
    });
  };

  render() {
    return (
      <Page
        breadcrumbAction={{
          content: 'Back to Sending Domains',
          as: PageLink,
          to: '/account/sending-domains',
        }}
        title="Add a Domain"
      >
        <Panel.LEGACY>
          <CreateForm onSubmit={this.handleCreate} />
        </Panel.LEGACY>
      </Page>
    );
  }
}

export default withRouter(connect(null, { createDomain, showAlert })(CreatePage));
