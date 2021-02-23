import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { ApiErrorBanner, Loading } from 'src/components';
import { Users } from 'src/components/images';
import { PageLink } from 'src/components/links';
import { Page } from 'src/components/matchbox';
import { listMonitors, listIncidents } from 'src/actions/blocklist';
import { selectIncidentsList } from 'src/selectors/blocklist';
import { getRelativeDates } from 'src/helpers/date';
import usePageFilters from 'src/hooks/usePageFilters';
import IncidentsCollection from './components/IncidentsCollection';

const filterConfiguration = {
  search: {},
};

export const IncidentsPage = props => {
  const { loading, error, listMonitors, listIncidents, monitors, incidents } = props;

  const currentDateTime = new Date();
  const [to, setTo] = useState(currentDateTime);
  const [from, setFrom] = useState(
    moment(currentDateTime)
      .subtract(30, 'days')
      .toDate(),
  );
  const [relativeRange, setRelativeRange] = useState('30days');

  const updateDateRange = ({ from, to, relativeRange }) => {
    if (to && from && relativeRange) {
      setTo(to);
      setFrom(from);
      setRelativeRange(relativeRange);
    } else {
      const dateRangeFromRelativeDate = getRelativeDates(relativeRange);
      setTo(dateRangeFromRelativeDate.to);
      setFrom(dateRangeFromRelativeDate.from);
      setRelativeRange(dateRangeFromRelativeDate.relativeRange);
    }
  };

  const { filters, updateFilters } = usePageFilters(filterConfiguration);

  const updateTextField = newSearch => {
    if (filters.search !== newSearch) {
      updateFilters({
        search: newSearch,
      });
    }
  };

  const dateOptions = {
    to,
    from,
    relativeRange,
  };

  useEffect(() => {
    listMonitors();
  }, [listMonitors]);

  useEffect(() => {
    listIncidents(from, to);
  }, [from, to, listIncidents]);

  if (loading) {
    return <Loading />;
  }

  const renderContent = () => {
    if (error) {
      return (
        <div data-id="error-banner">
          <ApiErrorBanner
            message="Sorry, we seem to have had some trouble loading your blocklist incidents."
            errorDetails={error.message}
            reload={() => {
              listMonitors();
              listIncidents();
            }}
          />
        </div>
      );
    }

    return (
      <div data-id="incidents-table">
        <IncidentsCollection
          incidents={incidents}
          dateOptions={dateOptions}
          updateDateRange={updateDateRange}
          updateTextField={updateTextField}
          search={filters.search}
        />
      </div>
    );
  };

  return (
    <Page
      empty={{
        show: monitors.length === 0,
        title: 'Blocklist Reports',
        image: Users,
        content: (
          <p>
            Keep an eye on your Domains and IPs and maintain a healthy sender reputation and improve
            your deliverability
          </p>
        ),
      }}
      title="Blocklist Incidents"
      primaryAction={{
        content: monitors.length === 0 ? 'Add to Monitored List' : 'View Monitored List',
        to:
          monitors.length === 0 ? '/signals/blocklist/monitors/add' : '/signals/blocklist/monitors',
        as: PageLink,
      }}
    >
      {renderContent()}
    </Page>
  );
};

const mapStateToProps = state => ({
  incidents: selectIncidentsList(state),
  monitors: state.blocklist.monitors,
  error: state.blocklist.incidentsError || state.blocklist.monitorsError,
  loading: state.blocklist.incidentsPending || state.blocklist.monitorsPending,
});
export default connect(mapStateToProps, { listMonitors, listIncidents })(IncidentsPage);
