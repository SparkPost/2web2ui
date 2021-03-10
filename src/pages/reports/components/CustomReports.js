import React from 'react';
import { connect } from 'react-redux';
import { addFilters, clearFilters, refreshReportOptions } from 'src/actions/reportOptions';
import { selectCustomReports } from 'src/selectors/customReports';
import { Save } from '@sparkpost/matchbox-icons';
import { saveReport, deleteReport } from 'src/actions/customReports';
import { withRouter } from 'react-router-dom';
import { Button, Panel, TextField } from 'src/components/matchbox';
import CustomReportsList from './CustomReportsList';
import { parseSearch } from 'src/helpers/reports';
import qs from 'query-string';
import _ from 'lodash';

import styles from './CustomReports.module.scss';

const REPORT_LIMIT = 10;

export function CustomReports(props) {
  const {
    addFilters,
    deleteReport,
    clearFilters,
    searchOptions,
    loading,
    refreshReportOptions,
    reports,
    saveReport,
  } = props;

  const [name, setName] = React.useState('');

  function handleNameChange(e) {
    const value = e.target.value;

    // Limit string length
    if (value.length < 24) {
      setName(e.target.value);
    }
  }

  function handleSave() {
    let toSave = searchOptions;

    if (searchOptions.range !== 'custom') {
      toSave = _.omit(toSave, ['to', 'from']);
    }

    saveReport({
      name: name.trim(),
      url: qs.stringify(toSave),
    });
  }

  function handleLoad(report) {
    const { options, filters = [] } = parseSearch(report.url);
    clearFilters();
    addFilters(filters);
    refreshReportOptions(options);
    setName(report.name);
  }

  const isLimited = reports.length >= REPORT_LIMIT;
  const canOverwrite = _.find(reports, ['name', name.trim()]);
  const saveDisabled = name === '' || loading;

  return (
    <Panel.LEGACY.Section>
      <div className={styles.Wrap}>
        <div className={styles.NameWrapper}>
          <TextField
            id="custom-report-name"
            label="Report Name"
            labelHidden
            placeholder="Untitled Report"
            onChange={handleNameChange}
            value={name}
          />
        </div>

        {!isLimited || (canOverwrite && isLimited) ? (
          <Button disabled={saveDisabled} onClick={handleSave} flat color="orange">
            <Save className={styles.SaveIcon} />
            {loading ? 'Saving...' : 'Save'}
          </Button>
        ) : null}

        {isLimited && (
          <div className={styles.Limited}>You are limited to {REPORT_LIMIT} saved reports</div>
        )}

        <div className={styles.ReportsButton}>
          <CustomReportsList
            deleting={loading}
            handleLoad={handleLoad}
            reports={reports}
            onDelete={deleteReport}
          />
        </div>
      </div>
    </Panel.LEGACY.Section>
  );
}

const mapStateToProps = state => ({
  reports: selectCustomReports(state),
  loading: state.currentUser.userOptionsPending,
});

const mapDispatchToProps = {
  addFilters,
  clearFilters,
  refreshReportOptions,
  saveReport,
  deleteReport,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CustomReports));
