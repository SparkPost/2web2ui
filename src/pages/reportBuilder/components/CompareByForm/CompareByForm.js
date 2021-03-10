import React, { useReducer } from 'react';
import {
  Banner,
  Box,
  Button,
  Drawer,
  ScreenReaderOnly,
  Select,
  Stack,
} from 'src/components/matchbox';
import { Add, Close } from '@sparkpost/matchbox-icons';
import { Form } from 'src/components/form';
import { TranslatableText, Comparison } from 'src/components/text';

import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import { getQueryFromOptionsV2 } from 'src/helpers/metrics';
import Typeahead from './Typeahead';
import { FILTER_OPTIONS } from '../../constants';
import styled from 'styled-components';
import useAllowSubjectCampaignFilter from '../../hooks/useAllowSubjectCampaignFilter';

import { segmentTrack, SEGMENT_EVENTS } from 'src/helpers/segment';

const initialState = {
  filters: [null, null],
  filterType: undefined,
  hasMinComparisonsError: false,
  hasMaxComparisonsError: false,
  formChanged: false,
};

const StyledButton = styled(Button)`
  position: absolute;
  top: -40px;
  right: 0;
`;

const RemoveButton = ({ onClick }) => (
  <StyledButton padding="200" variant="minimal" onClick={onClick} size="small">
    <ScreenReaderOnly>Remove Filter</ScreenReaderOnly>
    <Button.Icon as={Close} />
  </StyledButton>
);

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_FILTER':
      return {
        ...state,
        filters: [...state.filters, null],
        formChanged: true,
        hasMaxComparisonsError: Boolean(state.filters.length >= 9), //Will now be 10
      };
    case 'REMOVE_FILTER':
      return {
        ...state,
        filters: state.filters.filter((_filter, filterIndex) => filterIndex !== action.index),
        hasMaxComparisonsError: false,
        formChanged: true,
      };
    case 'SET_FILTER':
      const newFilters = state.filters;
      newFilters[action.index] = action.value;
      return { ...state, filters: newFilters, hasMinComparisonsError: false };
    case 'SET_FILTER_TYPE':
      return {
        ...initialState,
        hasMinComparisonsError: false,
        hasMaxComparisonsError: false,
        filters: [null, null],
        filterType: action.filterType,
        formChanged: true,
      };
    case 'SET_MIN_COMPARE_ERROR':
      return { ...state, hasMinComparisonsError: true, formChanged: true };
    case 'RESET_FORM':
      return { ...initialState, filters: [null, null], filterType: undefined, formChanged: true };

    default:
      throw new Error(`${action.type} is not supported.`);
  }
};

const getInitialState = comparisons => {
  if (!comparisons || !comparisons.length) {
    return initialState;
  }

  return {
    ...initialState,
    filterType: comparisons[0].type,
    filters: [...comparisons],
  };
};

function CompareByForm({ handleSubmit }) {
  const { state: reportOptions } = useReportBuilderContext();
  const { comparisons, to, from } = reportOptions;
  const [state, dispatch] = useReducer(reducer, getInitialState(comparisons));
  const { filters, filterType, hasMinComparisonsError, hasMaxComparisonsError } = state;

  function handleFormSubmit(e) {
    e.preventDefault();

    const formattedFilters = filters.filter(filter => filter !== null);

    if (formattedFilters.length < 2 && formattedFilters.length > 0) {
      return dispatch({
        type: 'SET_MIN_COMPARE_ERROR',
        error: 'Select more than one item to compare',
      });
    }

    segmentTrack(SEGMENT_EVENTS.REPORT_BUILDER_COMPARISON_ADDED, {
      formChanged: state.formChanged,
      comparisonType: state.filterType,
      numberOfComparisons: formattedFilters.length,
    });

    return handleSubmit({ comparisons: formattedFilters });
  }

  const FILTER_TYPES = useAllowSubjectCampaignFilter()
    ? FILTER_OPTIONS
    : FILTER_OPTIONS.filter(({ value }) => value !== 'subject_campaigns');

  const filterConfig = FILTER_TYPES.find(item => item.value === filterType);
  const filterAction = filterConfig?.action;
  const filterSelector = filterConfig?.selector;
  const filterLabel = filterConfig?.label;

  const areInputsFilled = filters.every(filter => filter !== null);
  const { to: formattedTo, from: formattedFrom } = getQueryFromOptionsV2({ to, from });

  return (
    <Form onSubmit={handleFormSubmit} id="reportbuilder-compareby-form">
      <Box padding="500" paddingBottom="8rem">
        <Stack>
          <Select
            placeholder="Select Resource"
            placeholderValue="Select Resource"
            id="compare_select"
            label="Type"
            onChange={e => {
              dispatch({ type: 'SET_FILTER_TYPE', filterType: e.target.value });
            }}
            options={FILTER_TYPES.map(({ label, value }) => ({ label, value }))}
            value={filterType || 'Select Resource'}
          />
          {filterType &&
            filters.map((filter, index) => {
              return (
                <Box key={`filter-typeahead-${index}`} position="relative">
                  {index > 0 && filter && filters.length > 2 ? (
                    <RemoveButton
                      onClick={() => {
                        dispatch({ type: 'REMOVE_FILTER', index });
                      }}
                    />
                  ) : null}
                  <Stack marginTop="200">
                    <Box>
                      <Typeahead
                        id={`typeahead-${index}`}
                        customOptionHelpText="Add Comparison"
                        lookaheadRequest={filterAction}
                        selector={filterSelector}
                        lookaheadOptions={{ to: formattedTo, from: formattedFrom }}
                        label={filterLabel}
                        labelHidden
                        itemToString={item => (item?.value ? item.value : '')}
                        selectedItem={filter}
                        onChange={value => {
                          dispatch({ type: 'SET_FILTER', index, value });
                        }}
                      />
                    </Box>
                    {index < filters.length - 1 && ( //Only the last one
                      <Box>
                        <Comparison>And</Comparison>
                      </Box>
                    )}
                  </Stack>
                </Box>
              );
            })}
          {filterType && areInputsFilled && filters.length < 10 && (
            <Box>
              <Button
                onClick={() => {
                  dispatch({ type: 'ADD_FILTER' });
                }}
                size="small"
              >
                <TranslatableText>{`Add ${filterLabel}`}</TranslatableText>
                <Button.Icon as={Add} />
              </Button>
            </Box>
          )}
          {hasMinComparisonsError && (
            <Box>
              <Banner size="small" status="danger">
                Select more than one item to compare{' '}
              </Banner>
            </Box>
          )}
          {hasMaxComparisonsError && (
            <Box>
              <Banner size="small" status="warning">
                Limit on number of comparisons reached
              </Banner>
            </Box>
          )}
        </Stack>
      </Box>
      <Drawer.Footer>
        <Box display="flex">
          <Box pr="100" flex="1">
            <Button width="100%" type="submit" variant="primary">
              Compare
            </Button>
          </Box>
          <Box pl="100" flex="1">
            <Button
              width="100%"
              onClick={() => {
                dispatch({ type: 'RESET_FORM' });
              }}
              variant="secondary"
            >
              Clear Comparison
            </Button>
          </Box>
        </Box>
      </Drawer.Footer>
    </Form>
  );
}

export default CompareByForm;
