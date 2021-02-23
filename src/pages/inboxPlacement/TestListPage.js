import React, { useEffect } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { listTests } from 'src/actions/inboxPlacement';
import { ApiErrorBanner, Loading } from 'src/components';
import FilterSortCollection from 'src/components/collection/FilterSortCollection';
import { Users } from 'src/components/images';
import { PageLink } from 'src/components/links';
import { Page, Panel, Table, Tag } from 'src/components/matchbox';
import { Bold, PageDescription, SubduedText } from 'src/components/text';
import { formatApiTimestamp } from 'src/helpers/date';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import usePageFilters from 'src/hooks/usePageFilters';
import formatScheduleLine from './helpers/formatScheduleLine';
import formatPercentage from './helpers/formatPercentage';
import TrendsChart from './components/TrendsChart';
import TrendsFilters from './components/TrendsFilters';
import { RELATIVE_DATE_OPTIONS } from './constants/filters';
import OGStyles from './TestListPage.module.scss';
import HibanaStyles from './TestListPageHibana.module.scss';

const FilterSortCollectionRow = ({
  id,
  status,
  subject,
  test_name,
  from_address,
  start_time,
  end_time,
  placement,
}) => {
  const styles = useHibanaOverride(OGStyles, HibanaStyles);

  return [
    <Table.Row
      key={id}
      rowData={[
        <>
          <PageLink to={`/inbox-placement/details/${id}`}>{subject}</PageLink>
          <div>
            {test_name && (
              <>
                <Bold>{test_name}</Bold>
                <span className={styles.Delimiter}>|</span>
              </>
            )}
            <span>{from_address}</span>
          </div>
          <div>{formatScheduleLine(status, start_time, end_time)}</div>
        </>,
        <Tag className={styles.StatusTag}>{status}</Tag>,
        <div className={styles.MetricTableCell}>
          <SubduedText as="div">Inbox</SubduedText>
          <div>
            <Bold>{formatPercentage(placement.inbox_pct)}</Bold>
          </div>
        </div>,
        <div className={styles.MetricTableCell}>
          <SubduedText as="div">Spam</SubduedText>
          <div>
            <Bold>{formatPercentage(placement.spam_pct)}</Bold>
          </div>
        </div>,
        <div className={styles.MetricTableCell}>
          <SubduedText as="div">Missing</SubduedText>
          <div>
            <Bold>{formatPercentage(placement.missing_pct)}</Bold>
          </div>
        </div>,
      ]}
    />,
  ];
};

//TODO See if minDays from /helpers/validation can be used
const validateDate = ({ from, to }) => {
  const momentFrom = moment(from);
  const momentTo = moment(to);
  if (momentTo.diff(momentFrom, 'days') < 7) {
    return 'Select a range of at least 7 days';
  }
  return false;
};

const now = Date.now();

const allowedListFilters = {
  dateRange: {
    defaultValue: {
      from: formatApiTimestamp(moment(now).subtract(30, 'd')),
      to: formatApiTimestamp(now),
    },
    validate: ({ from, to }) => {
      const momentFrom = moment.utc(from);
      const momentTo = moment.utc(to);
      return (
        momentFrom.isValid() &&
        momentTo.isValid() &&
        momentFrom.isBefore(momentTo) &&
        momentTo.diff(momentFrom, 'days') >= 7
      );
    },
  },
  range: {
    defaultValue: '30days',
    excludeFromRoute: true,
    validate: range => RELATIVE_DATE_OPTIONS.includes(range),
  },
  tags: {
    defaultValue: {
      from_domains: '',
      mailbox_providers: '',
      regions: '',
      sending_ips: '',
    },
    normalize: val =>
      Object.keys(val).reduce((acc, curr) => {
        if (val[curr]) {
          acc[curr] = val[curr];
        }
        return acc;
      }, {}),
  },
};

export const TestListPage = ({ tests, error, loading, listTests }) => {
  const styles = useHibanaOverride(OGStyles, HibanaStyles);
  const { filters, updateFilters } = usePageFilters(allowedListFilters);

  useEffect(() => {
    listTests();
  }, [listTests]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Page
      empty={{
        show: !error && tests.length === 0,
        title: 'Find and Fix Inbox Placement Issues',
        image: Users,
        content: (
          <p>
            Perform seedlist tests that help you predict how your emails are handled by mailbox
            providers.
          </p>
        ),
      }}
      title="Inbox Placement"
      primaryAction={{
        content: 'Start a Test',
        to: '/inbox-placement/seedlist',
        as: PageLink,
      }}
    >
      {error ? (
        <ApiErrorBanner
          message="Sorry, we seem to have had some trouble loading your tests."
          errorDetails={error.message}
          reload={listTests}
        />
      ) : (
        <>
          <PageDescription className={styles.Description}>
            An Inbox Placement Test can tell you if you are actually landing in the recipients
            inbox. We can provide insight into what mailbox providers are doing with your email.
          </PageDescription>
          <Panel.LEGACY title="Inbox Placement Trends">
            <Panel.LEGACY.Section>
              <TrendsFilters
                filters={filters}
                updateFilters={updateFilters}
                validateDate={validateDate}
              />
            </Panel.LEGACY.Section>

            <TrendsChart filters={filters} />
          </Panel.LEGACY>
          <FilterSortCollection
            title="Inbox Placement Tests"
            selectOptions={[
              { value: 'Sort By', label: 'Sort By', disabled: true },
              { value: 'start_time', label: 'Start Time' },
              { value: 'placement.inbox_pct', label: 'Inbox' },
              { value: 'placement.spam_pct', label: 'Spam' },
              { value: 'placement.missing_pct', label: 'Missing' },
            ]}
            filterBoxConfig={{
              show: true,
              itemToStringKeys: ['subject', 'test_name', 'from_address'],
              placeholder: 'Search By: Subject, Placement Name, From Address',
              wrapper: props => props,
            }}
            defaultSortColumn="start_time"
            rows={tests}
            rowComponent={FilterSortCollectionRow}
          />
        </>
      )}
    </Page>
  );
};

const mapStateToProps = state => ({
  tests: state.inboxPlacement.tests || [],
  error: state.inboxPlacement.testsError,
  loading: state.inboxPlacement.testsPending,
});

export default withRouter(connect(mapStateToProps, { listTests })(TestListPage));
