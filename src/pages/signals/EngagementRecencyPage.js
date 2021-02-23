import React from 'react';
import { getEngagementRecency } from 'src/actions/signals';
import { selectEngagementRecencyDetails } from 'src/selectors/signals';
import { PageLink } from 'src/components/links';
import { Box, Grid, Panel, Stack } from 'src/components/matchbox';
import BarChart from './components/charts/barchart/BarChart';
import { useHibana } from 'src/context/HibanaContext';
import DateFilter from './components/filters/DateFilter';
import EngagementRecencyActions from './components/actionContent/EngagementRecencyActions';
import InfoTooltip from './components/InfoTooltip';
import Legend from './components/charts/legend/Legend';
import Page from './components/SignalsPage';
import Tabs from './components/engagement/Tabs';
import TooltipMetric from 'src/components/charts/TooltipMetric';
import withDetails from './containers/withDetails';
import withDateSelection from './containers/withDateSelection';
import { ENGAGEMENT_RECENCY_COHORTS, ENGAGEMENT_RECENCY_INFO } from './constants/info';
import { Empty } from 'src/components';
import { PanelSectionLoading } from 'src/components/loading';
import { roundToPlaces } from 'src/helpers/units';
import moment from 'moment';
import _ from 'lodash';

import cohorts from './constants/cohorts';

export function EngagementRecencyPage(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;

  const getYAxisProps = () => ({
    tickFormatter: tick => `${roundToPlaces(tick * 100, 0)}%`,
    domain: [0, 1],
    ticks: [0, 0.25, 0.5, 0.75, 1.0],
  });

  const getXAxisProps = () => {
    const { xTicks } = props;
    return {
      ticks: xTicks,
      tickFormatter: tick => moment(tick).format('M/D'),
    };
  };

  const getTooltipContent = ({ payload = {} }) => {
    return (
      <Stack>
        {_.keys(cohorts).map(key => (
          <TooltipMetric
            key={key}
            color={isHibanaEnabled ? cohorts[key].hibanaFill : cohorts[key].OGFill}
            label={cohorts[key].label}
            description={cohorts[key].description}
            value={`${roundToPlaces(payload[`c_${key}`] * 100, 1)}%`}
          />
        ))}
      </Stack>
    );
  };

  const renderContent = () => {
    const {
      data = [],
      empty,
      error,
      facet,
      facetId,
      gap,
      handleDateSelect,
      loading,
      selectedDate,
      subaccountId,
      hoveredDate,
      handleDateHover,
      resetDateHover,
      shouldHighlightSelected,
    } = props;

    const selectedCohorts = _.find(data, ['date', selectedDate]) || {};
    let chartPanel;

    if (empty) {
      chartPanel = <Empty message="Insufficient data to populate this chart" />;
    }

    if (error) {
      chartPanel = <Empty message="Unable to Load Data" />;
    }

    if (loading) {
      chartPanel = <PanelSectionLoading height="250px" />;
    }

    return (
      <Grid>
        <Grid.Column sm={12} md={7}>
          <Panel.LEGACY data-id="engagement-recency-cohorts-chart">
            <Tabs facet={facet} facetId={facetId} subaccountId={subaccountId} />
            {chartPanel || (
              <Panel.LEGACY.Section>
                <div className="LiftTooltip">
                  <BarChart
                    gap={gap}
                    onMouseOver={handleDateHover}
                    onMouseOut={resetDateHover}
                    onClick={handleDateSelect}
                    selected={selectedDate}
                    hovered={hoveredDate}
                    shouldHighlightSelected={shouldHighlightSelected}
                    timeSeries={data}
                    tooltipContent={getTooltipContent}
                    tooltipWidth="250px"
                    yKeys={_.keys(cohorts)
                      .map(key => {
                        return {
                          key: `c_${key}`,
                          fill: isHibanaEnabled ? cohorts[key].hibanaFill : cohorts[key].OGFill,
                          stroke: isHibanaEnabled
                            ? cohorts[key].hibanaStroke
                            : cohorts[key].OGStroke,
                          ...cohorts[key],
                        };
                      })
                      .reverse()}
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
                <EngagementRecencyActions cohorts={selectedCohorts} date={selectedDate} />
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
      title={
        <>
          Engagement Recency
          <InfoTooltip content={ENGAGEMENT_RECENCY_INFO} />
        </>
      }
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
  withDateSelection(EngagementRecencyPage),
  { getEngagementRecency },
  selectEngagementRecencyDetails,
);
