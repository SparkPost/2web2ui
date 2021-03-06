import React from 'react';
import { getComplaintsByCohort, getEngagementRecency } from 'src/actions/signals';
import { selectComplaintsByCohortDetails } from 'src/selectors/signals';
import { PageLink } from 'src/components/links';
import { Box, Grid, Panel, Stack } from 'src/components/matchbox';
import { useHibana } from 'src/context/HibanaContext';
import LineChart from './components/charts/linechart/LineChart';
import Legend from './components/charts/legend/Legend';
import DateFilter from './components/filters/DateFilter';
import ComplaintsByCohortActions from './components/actionContent/ComplaintsByCohortActions';
import Page from './components/SignalsPage';
import Tabs from './components/engagement/Tabs';
import TooltipMetric from 'src/components/charts/TooltipMetric';
import withDetails from './containers/withDetails';
import withDateSelection from './containers/withDateSelection';
import { ENGAGEMENT_RECENCY_COHORTS } from './constants/info';
import { Empty } from 'src/components';
import { PanelSectionLoading } from 'src/components/loading';
import { roundToPlaces } from 'src/helpers/units';
import moment from 'moment';
import _ from 'lodash';
import cohorts from './constants/cohorts';

export function ComplaintsByCohortPage(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  const isEmpty = () => {
    const { data } = props;

    // Returns true with 0 total complaints
    return data.every(({ p_total_fbl }) => !p_total_fbl);
  };

  const getYAxisProps = () => ({
    domain: isEmpty() ? [0, 1] : ['auto', 'auto'],
    tickFormatter: tick => `${roundToPlaces(tick * 100, 3)}%`,
  });

  const getXAxisProps = () => {
    const { xTicks } = props;

    return {
      ticks: xTicks,
      tickFormatter: tick => moment(tick).format('M/D'),
    };
  };

  const getTooltipContent = ({ payload = {} }) => {
    const metrics = _.keys(cohorts).reduce(
      (acc, key) => [
        ...acc,
        {
          ...cohorts[key],
          fill: isHibanaEnabled ? cohorts[key].hibanaFill : cohorts[key].OGFill,
          stroke: isHibanaEnabled ? cohorts[key].hibanaStroke : cohorts[key].OGStroke,
          key,
          value: payload[`p_${key}_fbl`],
        },
      ],
      [],
    );

    return (
      <Stack>
        {_.orderBy(metrics, 'value', 'desc').map(metric => (
          <TooltipMetric
            key={metric.key}
            color={metric.fill}
            label={metric.label}
            description={metric.description}
            value={`${roundToPlaces(metric.value * 100, 3)}%`}
          />
        ))}
      </Stack>
    );
  };

  const renderContent = () => {
    const {
      data = [],
      dataEngRecency = [],
      facet,
      facetId,
      handleDateSelect,
      loading,
      empty,
      error,
      selectedDate,
      shouldHighlightSelected,
      subaccountId,
    } = props;
    const selectedComplaints = _.find(data, ['date', selectedDate]) || {};
    const selectedEngagementRecency = _.find(dataEngRecency, ['date', selectedDate]) || {};
    let chartPanel;

    if (empty) {
      chartPanel = <Empty message="Insufficient data to populate this chart" />;
    }

    if (error) {
      chartPanel = <Empty message="Unable to Load Data" />;
    }

    if (loading) {
      chartPanel = <PanelSectionLoading minHeight="250px" />;
    }

    return (
      <Grid>
        <Grid.Column sm={12} md={7}>
          <Panel.LEGACY data-id="complaint-rate-chart">
            <Tabs facet={facet} facetId={facetId} subaccountId={subaccountId} />
            {chartPanel || (
              <Panel.LEGACY.Section>
                <div className="LiftTooltip">
                  <LineChart
                    height={300}
                    onClick={handleDateSelect}
                    selected={selectedDate}
                    shouldHighlightSelected={shouldHighlightSelected}
                    lines={data}
                    tooltipWidth="250px"
                    tooltipContent={getTooltipContent}
                    yKeys={_.keys(cohorts).map(key => {
                      return {
                        key: `p_${key}_fbl`,
                        ...cohorts[key],
                        fill: isHibanaEnabled ? cohorts[key].hibanaFill : cohorts[key].OGFill,
                        stroke: isHibanaEnabled ? cohorts[key].hibanaStroke : cohorts[key].OGStroke,
                      };
                    })}
                    yAxisProps={getYAxisProps()}
                    xAxisProps={getXAxisProps()}
                  />
                  <Legend
                    items={_.values(cohorts)}
                    tooltipContent={label => ENGAGEMENT_RECENCY_COHORTS[label]}
                  />
                </div>
              </Panel.LEGACY.Section>
            )}
          </Panel.LEGACY>
        </Grid.Column>
        <Grid.Column sm={12} md={5} mdOffset={0}>
          <div>
            {!chartPanel && (
              <Box as={Panel.LEGACY}>
                <ComplaintsByCohortActions
                  complaintsByCohort={selectedComplaints}
                  recencyByCohort={selectedEngagementRecency}
                  date={selectedDate}
                />
              </Box>
            )}
          </div>
        </Grid.Column>
      </Grid>
    );
  };

  const { facet, facetId, subaccountId } = props;

  return (
    <Page
      breadcrumbAction={{
        content: 'Back to Engagement Recency Overview',
        to: '/signals/engagement',
        as: PageLink,
      }}
      title="Complaints by Cohort"
      facet={facet}
      facetId={facetId}
      subaccountId={subaccountId}
    >
      <Panel.LEGACY>
        <Panel.LEGACY.Section>
          <Grid>
            <Grid.Column xs={12} md={4}>
              <DateFilter label="Date Range" />
            </Grid.Column>
          </Grid>
        </Panel.LEGACY.Section>
      </Panel.LEGACY>
      {renderContent()}
    </Page>
  );
}

export default withDetails(
  withDateSelection(ComplaintsByCohortPage),
  { getComplaintsByCohort, getEngagementRecency },
  selectComplaintsByCohortDetails,
);
