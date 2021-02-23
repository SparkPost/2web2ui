import React, { Component } from 'react';
import withAlertsCreate from './containers/CreatePage.container';
import AlertForm from './components/AlertForm';
import formatFormValues from './helpers/formatFormValues';
import { Loading } from 'src/components';
import { RedirectAndAlert } from 'src/components/globalAlert';
import { PageLink } from 'src/components/links';
import { Page } from 'src/components/matchbox';
import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';

export class CreatePage extends Component {
  componentDidMount() {
    const { getAlert, idToDuplicate } = this.props;
    if (idToDuplicate) {
      getAlert({ id: idToDuplicate });
    }
  }

  handleCreate = values => {
    const { createAlert, showUIAlert, history } = this.props;
    return createAlert({
      data: formatFormValues(values),
    }).then(({ id }) => {
      showUIAlert({ type: 'success', message: 'Alert created' });
      history.push(`/alerts/details/${id}`);
      segmentTrack(SEGMENT_EVENTS.ALERT_CREATED);
    });
  };

  render() {
    const { loading, getError, getLoading, idToDuplicate } = this.props;

    if (getLoading) {
      return <Loading />;
    }

    if (getError) {
      return <RedirectAndAlert to="/alerts" alert={{ type: 'error', message: getError.message }} />;
    }

    const backBreadcrumb = idToDuplicate
      ? { content: 'Back to Alert', to: `/alerts/details/${idToDuplicate}` }
      : { content: 'Back to Alerts', to: '/alerts' };
    return (
      <Page title="Create Alert" breadcrumbAction={{ ...backBreadcrumb, as: PageLink }}>
        <AlertForm
          submitting={loading}
          onSubmit={this.handleCreate}
          isDuplicate={Boolean(idToDuplicate)}
          isNewAlert={true}
        />
      </Page>
    );
  }
}

export default withAlertsCreate(CreatePage);
