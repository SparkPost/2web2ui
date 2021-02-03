import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  addFilters,
  removeFilter,
  refreshReportOptions,
  refreshTypeaheadCache,
  initTypeaheadCache,
} from 'src/actions/reportOptions';
import ShareModal from './ShareModal';
import PrecisionSelector from './PrecisionSelector';
import { parseSearch } from 'src/helpers/reports';
import { isForcedUTCRollupPrecision } from 'src/helpers/metrics';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import Typeahead from './Typeahead';
import { Grid, Panel, Select, Tag, Tooltip } from 'src/components/matchbox';
import DatePicker from 'src/components/datePicker/DatePicker';
import typeaheadCacheSelector from 'src/selectors/reportFilterTypeaheadCache';
import { TimezoneTypeahead } from 'src/components/typeahead/TimezoneTypeahead';
import CustomReports from './CustomReports';
import _ from 'lodash';
import config from 'src/config';
import OGStyles from './ReportOptions.module.scss';
import hibanaStyles from './ReportOptionsHibana.module.scss';

const { metricsRollupPrecisionMap } = config;
const RELATIVE_DATE_OPTIONS = ['hour', 'day', '7days', '30days', '90days', 'custom'];
const PRECISION_OPTIONS = metricsRollupPrecisionMap.map(({ value }) => ({
  value,
  label: _.startCase(_.words(value).join(' ')),
}));

export class ReportOptionsClassComponent extends Component {
  state = {
    shownPrecision: '',
  };

  componentDidMount() {
    const { options, filters = [] } = parseSearch(this.props.location.search);
    this.props.addFilters(filters);
    this.props.refreshReportOptions(options);

    // initial typeahead cache load
    this.props.initTypeaheadCache();
  }

  updateShownPrecision = shownPrecision => {
    this.setState({ shownPrecision });
  };

  renderActiveFilters = () => {
    const { reportOptions, styles } = this.props;

    return reportOptions.filters.length ? (
      <Panel.LEGACY.Section>
        <small>Filters:</small>
        {reportOptions.filters.map((item, index) => (
          <Tag
            key={index}
            onRemove={() => this.handleFilterRemove(index)}
            className={styles.TagWrapper}
          >
            {item.type}: {item.value}
          </Tag>
        ))}
      </Panel.LEGACY.Section>
    ) : null;
  };

  handleFilterRemove = index => {
    this.props.removeFilter(index);
  };

  handleTypeaheadSelect = item => {
    this.props.addFilters([item]);
  };

  handleTimezoneSelect = timezone => {
    const { refreshReportOptions } = this.props;
    refreshReportOptions({ timezone: timezone.value });
  };

  getPanelContent = () => {
    const {
      typeaheadCache,
      reportOptions,
      reportLoading,
      refreshReportOptions,
      searchOptions,
      styles,
    } = this.props;

    const isForcedUTC =
      reportOptions.precision && isForcedUTCRollupPrecision(reportOptions.precision);

    const isShownForcedUTC =
      this.state.shownPrecision && isForcedUTCRollupPrecision(this.state.shownPrecision);

    const timezoneDisabled = reportLoading || (isForcedUTC && this.state.shownPrecision === '');

    const timezoneTypeahead = (
      <TimezoneTypeahead
        initialValue={reportOptions.timezone}
        onChange={this.handleTimezoneSelect}
        isForcedUTC={isForcedUTC}
        disabledAndUTCOnly={!!isShownForcedUTC}
        disabled={timezoneDisabled}
      />
    );

    return (
      <>
        <Panel.LEGACY.Section>
          <Grid>
            <Grid.Column xs={9} md={6}>
              <Typeahead
                reportOptions={reportOptions}
                placeholder="Filter by domain, campaign, etc"
                onSelect={this.handleTypeaheadSelect}
                items={typeaheadCache}
                selected={reportOptions.filters}
                disabled={reportLoading}
              />
            </Grid.Column>
            <Grid.Column xs={3} md={2} mdOffset={4}>
              <ShareModal disabled={reportLoading} searchOptions={searchOptions} />
            </Grid.Column>
          </Grid>
        </Panel.LEGACY.Section>
        <Panel.LEGACY.Section>
          <Grid>
            <Grid.Column xs={12} md={6}>
              <div className={styles.FieldWrapperMetricsRollup}>
                <DatePicker
                  {...reportOptions}
                  label="Date Range"
                  relativeDateOptions={RELATIVE_DATE_OPTIONS}
                  disabled={reportLoading}
                  onChange={refreshReportOptions}
                  roundToPrecision={true}
                  selectPrecision={true}
                  updateShownPrecision={this.updateShownPrecision}
                />
              </div>
            </Grid.Column>
            <Grid.Column xs={6} md={4}>
              <div className={styles.TimezoneTooltipWrapper}>
                <Tooltip
                  disabled={!isShownForcedUTC && !timezoneDisabled}
                  content="Day, week, and month precision only support UTC."
                >
                  {timezoneTypeahead}
                </Tooltip>
              </div>
            </Grid.Column>
            <Grid.Column xs={6} md={2}>
              {//We will show a fake selector that shows the temporary precision when the user
              //is selecting dates using the datepicker but has not confirmed the selection
              !this.state.shownPrecision ? (
                <PrecisionSelector
                  from={reportOptions.from}
                  to={reportOptions.to}
                  selectedPrecision={reportOptions.precision}
                  changeTime={refreshReportOptions}
                  disabled={reportLoading}
                />
              ) : (
                <Select
                  id="precision-select"
                  label="Precision"
                  options={PRECISION_OPTIONS}
                  value={this.state.shownPrecision}
                  disabled={reportLoading}
                  readOnly
                />
              )}
            </Grid.Column>
          </Grid>
        </Panel.LEGACY.Section>
      </>
    );
  };

  render() {
    const { customReportsEnabled, searchOptions } = this.props;

    return (
      <div data-id="report-options">
        <Panel.LEGACY>
          {customReportsEnabled && <CustomReports searchOptions={searchOptions} />}
          {this.getPanelContent()}
          {this.renderActiveFilters()}
        </Panel.LEGACY>
      </div>
    );
  }
}

// TODO: Wrapping component just until the OG theme is removed to pass in styles - won't be needed in the future.
function ReportOptions(props) {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);

  return <ReportOptionsClassComponent styles={styles} {...props} />;
}

const mapStateToProps = state => ({
  reportOptions: state.reportOptions,
  typeaheadCache: typeaheadCacheSelector(state),
});

const mapDispatchToProps = {
  addFilters,
  removeFilter,
  refreshReportOptions,
  initTypeaheadCache,
  refreshTypeaheadCache,
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ReportOptions));
