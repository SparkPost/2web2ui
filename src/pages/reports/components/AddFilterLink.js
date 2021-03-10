import React, { useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import qs from 'qs';

import { addFilters } from 'src/actions/reportOptions';
import { PageLink } from 'src/components/links';
import { stringifyTypeaheadfilter } from 'src/helpers/string';
import {
  selectReportSearchOptions,
  selectSummaryChartSearchOptions,
} from 'src/selectors/reportSearchOptions';

export const AddFilterLink = ({
  //From parent
  newFilter,
  reportType,
  content,
  //From redux
  currentSearchOptions,
  addFilters,
}) => {
  const [isNewTabKeyPressed, setNewTabKeyPressed] = useState(false);

  const currentFilters = currentSearchOptions.filters || [];

  /**
   * Needs to first check if cmd/ctrl key is pressed when mouse is released
   * Then it's saved for use in the onClick handler. We need both because
   * onClick does not have the correct values for metaKey and ctrlKey
   **/
  const handleMouseUp = e => {
    setNewTabKeyPressed(e.metaKey || e.ctrlKey);
  };

  const handleClick = () => {
    if (!isNewTabKeyPressed) {
      addFilters([newFilter]);
    }
  };

  const mergedFilters = _.uniqWith(
    [...currentFilters, stringifyTypeaheadfilter(newFilter)],
    _.isEqual,
  );
  const newSearchOptions = { ...currentSearchOptions, filters: mergedFilters };
  const linkParams = qs.stringify(newSearchOptions, { arrayFormat: 'repeat' });
  const fullLink = `/reports/${reportType}/?${linkParams}`;

  return (
    <PageLink onMouseUp={handleMouseUp} onClick={handleClick} to={fullLink} replace>
      {content}
    </PageLink>
  );
};

const mapStateToProps = (state, props) => ({
  currentSearchOptions:
    props.reportType === 'summary'
      ? selectSummaryChartSearchOptions(state)
      : selectReportSearchOptions(state),
});

export default connect(mapStateToProps, { addFilters })(AddFilterLink);
