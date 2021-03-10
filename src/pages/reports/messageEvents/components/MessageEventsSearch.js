import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import {
  getMessageEvents,
  refreshMessageEventsDateRange,
  updateMessageEventsSearchOptions,
  addFilters,
} from 'src/actions/messageEvents';
import { selectMessageEventsSearchOptions } from 'src/selectors/messageEvents';
import AdvancedFiltersModal from './AdvancedFiltersModal';
import ActiveFilters from './ActiveFilters';
import ShareModal from '../../components/ShareModal';
import DatePicker from 'src/components/datePicker/DatePicker';
import { Panel, TextField } from 'src/components/matchbox';
import { recipientEmail as recipientEmailValidator } from 'src/helpers/validation';
import { parseSearch } from 'src/helpers/messageEvents';
import { stringToArray } from 'src/helpers/string';
import { onEnter } from 'src/helpers/keyEvents';
import { FORMATS, RELATIVE_DATE_OPTIONS, ALL_EVENTS_FILTERS } from 'src/constants';
import config from 'src/config';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import OGStyles from './MessageEventsSearch.module.scss';
import hibanaStyles from './MessageEventsSearchHibana.module.scss';

export class MessageEventsSearchComponent extends Component {
  state = {
    recipientError: null,
  };

  componentDidMount() {
    const {
      updateMessageEventsSearchOptions,
      refreshMessageEventsDateRange,
      location,
      search,
    } = this.props;
    refreshMessageEventsDateRange({ relativeRange: search.dateOptions.relativeRange }); // Sets default dateoptions from initial state
    updateMessageEventsSearchOptions(parseSearch(location.search));
  }

  getInvalidAddresses = addresses => {
    const invalids = _.filter(addresses, address => {
      address = _.trim(address);

      return address && recipientEmailValidator(address) !== undefined;
    });

    return invalids;
  };

  handleRecipientsChange = event => {
    const value = event.target.value;
    const recipients = stringToArray(value);
    const invalids = this.getInvalidAddresses(recipients);

    if (invalids.length) {
      this.setState({
        recipientError: `${invalids.join(', ')} ${
          invalids.length > 1 ? 'are not' : 'is not a'
        } valid email ${invalids.length > 1 ? 'addresses' : 'address'}`,
      });
      return;
    }

    event.target.value = '';
    this.setState({ recipientError: null });
    this.props.addFilters({ recipients });
  };

  render() {
    const {
      search,
      refreshMessageEventsDateRange,
      loading,
      now = new Date(),
      searchOptions,
      styles,
    } = this.props;
    const { retentionPeriodDays } = config.messageEvents;
    const { recipients } = ALL_EVENTS_FILTERS;

    return (
      <Panel.LEGACY mb="0" className={styles.Panel}>
        <Panel.LEGACY.Section>
          <div className={styles.Filters}>
            <div className={styles.DateFilter}>
              <DatePicker
                {...search.dateOptions}
                relativeDateOptions={RELATIVE_DATE_OPTIONS}
                disabled={loading}
                onChange={refreshMessageEventsDateRange}
                dateFieldFormat={FORMATS.DATE_FNS.DATETIME}
                datePickerProps={{
                  disabledDays: {
                    after: now,
                    before: moment(now)
                      .subtract(retentionPeriodDays, 'days')
                      .toDate(),
                  },
                  canChangeMonth: false,
                }}
              />
            </div>
            <div className={styles.RecipientFilter}>
              <label className={styles.ScreenReaderOnlyLabel} htmlFor="email-recipients-filter">
                Filter by Recipient Email Address
              </label>

              <TextField
                id="email-recipients-filter"
                placeholder={recipients.placeholder}
                onBlur={this.handleRecipientsChange}
                onKeyDown={onEnter(this.handleRecipientsChange)}
                onFocus={() => this.setState({ recipientError: null })}
                error={this.state.recipientError}
              />
            </div>
            <div>
              <AdvancedFiltersModal />
            </div>
            <div>
              <ShareModal disabled={loading} searchOptions={searchOptions} />
            </div>
          </div>
        </Panel.LEGACY.Section>
        <ActiveFilters />
      </Panel.LEGACY>
    );
  }
}
const MessageEventsSearch = props => {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);

  return <MessageEventsSearchComponent {...props} styles={styles} />;
};

const mapStateToProps = state => ({
  search: state.messageEvents.search,
  loading: state.messageEvents.loading,
  searchOptions: selectMessageEventsSearchOptions(state),
});
const mapDispatchToProps = {
  getMessageEvents,
  refreshMessageEventsDateRange,
  updateMessageEventsSearchOptions,
  addFilters,
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MessageEventsSearch));
