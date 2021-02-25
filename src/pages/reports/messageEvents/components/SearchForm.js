import React from 'react';
import { Button, Inline, Panel } from 'src/components/matchbox';
import { FieldArray, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { Form } from 'src/components/form';
import OGStyles from './SearchForm.module.scss';
import hibanaStyles from './SearchFormHibana.module.scss';
import { FORMS } from 'src/constants';
import EventTypeFilters from './EventTypeFilters';
import { getBooleanEventsObject, getSearchQueriesFromFilters } from '../helpers/transformData.js';
import { selectMessageEventListing } from 'src/selectors/eventListing';
import { getDocumentation, updateMessageEventsSearchOptions } from 'src/actions/messageEvents';
import SearchQuery from './SearchQuery';
import useHibanaOverride from 'src/hooks/useHibanaOverride';

const defaultFilters = [
  { key: 'recipient_domains' },
  { key: 'from_addresses' },
  { key: 'subjects' },
];

export function SearchForm(props) {
  const styles = useHibanaOverride(OGStyles, hibanaStyles);

  const { handleSubmit, handleApply, handleCancel, eventListing } = props;
  return (
    <Form onSubmit={handleSubmit(handleApply)} id="events-advanced-filter-form">
      <Panel.LEGACY title="Advanced Filters">
        <Panel.LEGACY.Section>
          <EventTypeFilters eventTypeDocs={eventListing} />
        </Panel.LEGACY.Section>
        <Panel.LEGACY.Section>
          <FieldArray component={SearchQuery} name="searchQuery" />
          <p>All filters accept comma-separated values.</p>
        </Panel.LEGACY.Section>
        <Panel.LEGACY.Section>
          <Inline>
            <Button variant="primary" submit>
              Apply Filters
            </Button>
            <Button className={styles.Cancel} variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </Inline>
        </Panel.LEGACY.Section>
      </Panel.LEGACY>
    </Form>
  );
}

const mapStateToProps = state => {
  const queryFilters = getSearchQueriesFromFilters(state.messageEvents.search);
  const initialFilters = queryFilters.length ? queryFilters : defaultFilters;

  return {
    initialValues: {
      searchQuery: [...initialFilters, {}],
      ...getBooleanEventsObject(state.messageEvents.search.events),
    },
    eventListing: selectMessageEventListing(state),
  };
};
export default connect(mapStateToProps, { updateMessageEventsSearchOptions, getDocumentation })(
  reduxForm({ form: FORMS.EVENTS_SEARCH, touchOnChange: true })(SearchForm),
);
