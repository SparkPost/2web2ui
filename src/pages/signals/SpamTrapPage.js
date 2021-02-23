/* eslint-disable max-lines */
import React, { useState } from 'react';
import { getSpamHits } from 'src/actions/signals';
import { selectSpamHitsDetails } from 'src/selectors/signals';
import { PageLink } from 'src/components/links';
import { Box, Grid, Panel, Stack } from 'src/components/matchbox';
import { useHibana } from 'src/context/HibanaContext';
import Page from './components/SignalsPage';
import BarChart from './components/charts/barchart/BarChart';
import SpamTrapActions from './components/actionContent/SpamTrapActions';
import TooltipMetric from 'src/components/charts/TooltipMetric';
import DateFilter from './components/filters/DateFilter';
import { SPAM_TRAP_INFO } from './constants/info';
import withDetails from './containers/withDetails';
import withDateSelection from './containers/withDateSelection';
import { Empty } from 'src/components';
import { PanelSectionLoading } from 'src/components/loading';
import Legend from './components/charts/legend/Legend';
import Calculation from './components/viewControls/Calculation';
import ChartHeader from './components/ChartHeader';
import { formatFullNumber, formatNumber, roundToPlaces } from 'src/helpers/units';
import moment from 'moment';
import _ from 'lodash';
import { spamTrapHitTypesCollection, spamTrapHitTypesByLabel } from './constants/spamTrapHitTypes';

export function SpamTrapPage(props) {
  const [state] = useHibana();
  const { isHibanaEnabled } = state;
  const [calculation, setCalculation] = useState('relative');

  const handleCalculationToggle = value => {
    setCalculation(value);
  };

  const getYAxisProps = () => {
    const { data } = props;

    return {
      tickFormatter:
        calculation === 'relative'
          ? tick => `${roundToPlaces(tick * 100, 3)}%`
          : tick => formatNumber(tick),
      domain:
        data.every(({ relative_trap_hits }) => !relative_trap_hits) && calculation === 'relative'
          ? [0, 1]
          : ['auto', 'auto'],
    };
  };

  const getXAxisProps = () => {
    const { xTicks } = props;

    return {
      ticks: xTicks,
      tickFormatter: tick => moment(tick).format('M/D'),
    };
  };

  const getTooltipContent = ({ payload = {} }) => (
    <Stack>
      {calculation === 'absolute' ? (
        <TooltipMetric label="Spam Trap Hits" value={formatFullNumber(payload.trap_hits)} />
      ) : (
        <TooltipMetric
          label="Spam Trap Rate"
          value={`${roundToPlaces(payload.relative_trap_hits * 100, 4)}%`}
        />
      )}

      <Stack>
        {spamTrapHitTypesCollection.map(({ OGFill, hibanaFill, key, label }) => {
          const fill = isHibanaEnabled ? hibanaFill : OGFill;

          return (
            <TooltipMetric
              color={fill}
              key={key}
              label={label}
              value={
                calculation === 'absolute'
                  ? `${formatFullNumber(payload[key])}`
                  : `${roundToPlaces(payload[`relative_${key}`] * 100, 4)}%`
              }
            />
          );
        })}
      </Stack>
      <TooltipMetric label="Injections" value={formatFullNumber(payload.injections)} />
    </Stack>
  );

  const renderContent = () => {
    const {
      data = [],
      handleDateSelect,
      loading,
      gap,
      empty,
      error,
      selectedDate,
      handleDateHover,
      resetDateHover,
      hoveredDate,
      shouldHighlightSelected,
    } = props;
    const selectedSpamTrapHits = _.find(data, ['date', selectedDate]) || {};
    let chartPanel;

    if (empty) {
      chartPanel = <Empty message="Insufficient data to populate this chart" />;
    }

    if (error) {
      chartPanel = <Empty message="Unable to Load Data" />;
    }

    if (loading) {
      chartPanel = <PanelSectionLoading minHeight="225px" />;
    }

    return (
      <Grid>
        <Grid.Column sm={12} md={7}>
          <Panel.LEGACY>
            <ChartHeader
              title="Spam Trap Monitoring"
              primaryArea={
                <Calculation initialSelected={calculation} onChange={handleCalculationToggle} />
              }
              tooltipContent={SPAM_TRAP_INFO}
            />
            {chartPanel || (
              <Panel.LEGACY.Section>
                <div className="LiftTooltip">
                  <BarChart
                    gap={gap}
                    onClick={handleDateSelect}
                    selected={selectedDate}
                    timeSeries={data}
                    onMouseOver={handleDateHover}
                    onMouseOut={resetDateHover}
                    hovered={hoveredDate}
                    shouldHighlightSelected={shouldHighlightSelected}
                    tooltipContent={getTooltipContent}
                    yKeys={spamTrapHitTypesCollection
                      .map(({ key, OGFill, hibanaFill }) => {
                        const fill = isHibanaEnabled ? hibanaFill : OGFill;

                        return {
                          fill,
                          key: calculation === 'relative' ? `relative_${key}` : key,
                        };
                      })
                      .reverse()}
                    yAxisProps={getYAxisProps()}
                    xAxisProps={getXAxisProps()}
                  />
                  <Legend
                    items={spamTrapHitTypesCollection}
                    tooltipContent={label => spamTrapHitTypesByLabel[label].description}
                  />
                </div>
              </Panel.LEGACY.Section>
            )}
          </Panel.LEGACY>
        </Grid.Column>
        <Grid.Column sm={12} md={5} mdOffset={0}>
          {!loading && !chartPanel && (
            <Box as={Panel.LEGACY}>
              {!chartPanel && (
                <SpamTrapActions
                  percent={selectedSpamTrapHits.relative_trap_hits}
                  date={selectedDate}
                />
              )}
            </Box>
          )}
        </Grid.Column>
      </Grid>
    );
  };

  const { facet, facetId, subaccountId } = props;

  return (
    <Page
      breadcrumbAction={{
        content: 'Back to Spam Trap Overview',
        to: '/signals/spam-traps',
        as: PageLink,
      }}
      title="Spam Traps"
      facet={facet}
      facetId={facetId}
      subaccountId={subaccountId}
    >
      <Panel.LEGACY title="Spam Trap Monitoring">
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

export default withDetails(withDateSelection(SpamTrapPage), { getSpamHits }, selectSpamHitsDetails);
