import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  fetchMetricsDomains,
  fetchMetricsCampaigns,
  fetchMetricsSendingIps,
  fetchMetricsIpPools,
  fetchMetricsTemplates,
} from 'src/actions/metrics';
import { list as listSubaccounts } from 'src/actions/subaccounts';
import { list as listSendingDomains } from 'src/actions/sendingDomains';
import { selectCacheReportBuilder } from 'src/selectors/reportFilterTypeaheadCache';
import { RadioButtonGroup } from 'src/components';
import {
  Button,
  Box,
  ComboBoxTextField,
  Columns,
  Column,
  Drawer,
  Panel,
  ScreenReaderOnly,
  Stack,
} from 'src/components/matchbox';
import { Uppercase, Comparison } from 'src/components/text';
import { getGroupingFields, getApiFormattedGroupings } from '../../helpers';
import { useReportBuilderContext } from '../../context/ReportBuilderContext';
import Typeahead from '../Typeahead';
import {
  AddButton,
  CompareBySelect,
  DuplicateErrorBanner,
  MultiEntryController,
  RemoveButton,
  TypeSelect,
} from './components';
import useFiltersForm from './useFiltersForm';

const FILTER_VALUE_PLACEHOLDER_TEXT = 'e.g. resource_01 or resource_02';

function FiltersForm({
  handleSubmit,
  fetchMetricsDomains,
  listSubaccounts,
  fetchMetricsCampaigns,
  fetchMetricsTemplates,
  listSendingDomains,
  fetchMetricsIpPools,
  fetchMetricsSendingIps,
  typeaheadCache,
}) {
  const { state, actions } = useFiltersForm();
  const { status } = state;
  const {
    setGroupingType,
    setFilterType,
    setFilterCompareBy,
    setFilterValues,
    addGrouping,
    addFilter,
    removeFilter,
    clearFilters,
    setFilters,
    submit,
  } = actions;
  const groupings = getGroupingFields(state.groupings);
  const { state: reportOptions } = useReportBuilderContext();
  const { filters } = reportOptions;

  function handleFormSubmit(e) {
    e.preventDefault(); // Prevents page refresh
    submit();
  }

  useEffect(() => {
    if (status === 'error') {
      // Using refs to manage focus is a *huge* pain with multiple elements - this isn't pretty but gets the job done and eliminates a *lot* of complexity
      // that comes with using a ref callback to store refs in an array.
      const errorBanners = document.querySelectorAll('[data-id="error-banner"]');

      errorBanners[0].focus();
    }

    // If the status changes to "success" (only possible via form submission) then call the passed in submit handler
    if (status === 'success') {
      handleSubmit({ filters: getApiFormattedGroupings(groupings) });
    }

    // For this effect, only care about the status changing, so not using an exhaustive dependency check here
    // eslint-disable-next-line
  }, [status]);

  useEffect(() => {
    setFilters(filters);
  }, [setFilters, filters]);

  const FILTERS = [
    {
      label: 'Recipient Domain',
      value: 'domains',
      action: fetchMetricsDomains,
    },
    {
      label: 'Sending IP',
      value: 'sending_ips',
      action: fetchMetricsSendingIps,
    },
    {
      label: 'IP Pool',
      value: 'ip_pools',
      action: fetchMetricsIpPools,
    },
    {
      label: 'Campaign',
      value: 'campaigns',
      action: fetchMetricsCampaigns,
    },
    {
      label: 'Template',
      value: 'templates',
      action: fetchMetricsTemplates,
    },
    {
      label: 'Sending Domain',
      value: 'sending_domains',
      action: listSendingDomains,
    },
    {
      label: 'Subaccount',
      value: 'subaccounts',
      action: listSubaccounts,
    },
  ];

  // Remove `action` from the options
  const filterOptions = FILTERS.map(filter => {
    return {
      label: filter.label,
      value: filter.value,
    };
  });

  return (
    <form onSubmit={handleFormSubmit}>
      <Box padding="500" paddingBottom="8rem">
        <Stack marginBottom="500">
          {groupings.map((grouping, groupingIndex) => {
            return (
              <div key={`grouping-${groupingIndex}`}>
                <Stack>
                  <Panel mb="0" data-id="grouping">
                    {grouping.filters.map((filter, filterIndex) => {
                      const filterConfig = FILTERS.find(item => item.value === filter.type); // Find the matching configuration entry
                      const filterRequest = filterConfig?.action;
                      const filterLabel = filterConfig?.label;
                      const filterValue = filterConfig?.value;

                      return (
                        <Box
                          as={Panel.Section}
                          position="relative"
                          key={`filters-${groupingIndex}-${filterIndex}`}
                        >
                          {status === 'error' &&
                          filterIndex === 0 &&
                          grouping.hasDuplicateFilters ? (
                            <Box marginY="400">
                              <DuplicateErrorBanner data-id="error-banner" />
                            </Box>
                          ) : null}

                          <Box as="fieldset" border="0" padding="0">
                            <ScreenReaderOnly as="legend">Filter By</ScreenReaderOnly>

                            <Stack space="400">
                              <Columns>
                                <Column>
                                  <TypeSelect
                                    onChange={e =>
                                      setFilterType({
                                        filterType: e.target.value,
                                        groupingIndex,
                                        filterIndex,
                                      })
                                    }
                                    id={`filter-by-${groupingIndex}-${filterIndex}`}
                                    value={filterValue || undefined}
                                    options={filterOptions}
                                  />
                                </Column>

                                <Column>
                                  {filter.hasCompareBySelect ? (
                                    <CompareBySelect
                                      onChange={e =>
                                        setFilterCompareBy({
                                          compareBy: e.target.value,
                                          groupingIndex,
                                          filterIndex,
                                        })
                                      }
                                      id={`compare-by-${groupingIndex}-${filterIndex}`}
                                      hasLikeOptions={filter.hasCompareByLikeOptions}
                                      value={filter.compareBy}
                                    />
                                  ) : null}
                                </Column>
                              </Columns>

                              {filter.valueField === 'typeahead' ? (
                                <Typeahead
                                  id={`typeahead-${groupingIndex}-${filterIndex}`}
                                  lookaheadRequest={filterRequest}
                                  itemToString={item => (item?.value ? item.value : '')}
                                  groupingIndex={groupingIndex}
                                  filterType={filter.type}
                                  filterIndex={filterIndex}
                                  setFilterValues={setFilterValues}
                                  value={filter.values}
                                  type={filterLabel}
                                  label={filterLabel}
                                  results={typeaheadCache[filterLabel]}
                                  placeholder={FILTER_VALUE_PLACEHOLDER_TEXT}
                                />
                              ) : null}

                              {filter.valueField === 'multi-entry' ? (
                                <MultiEntryController
                                  id={`multi-entry-${groupingIndex}-${filterIndex}`}
                                  initialValueList={filter.values}
                                  setFilterValues={setFilterValues}
                                  filterIndex={filterIndex}
                                  groupingIndex={groupingIndex}
                                  render={props => {
                                    return (
                                      <ComboBoxTextField
                                        label={filterLabel}
                                        id={props.id}
                                        removeItem={props.handleRemove}
                                        onBlur={props.handleBlur}
                                        onKeyDown={props.handleKeyDown}
                                        onChange={props.handleChange}
                                        value={props.value}
                                        error={props.error}
                                        selectedItems={props.valueList}
                                        itemToString={item => (item ? item : '')}
                                        placeholder={FILTER_VALUE_PLACEHOLDER_TEXT}
                                      />
                                    );
                                  }}
                                />
                              ) : null}

                              {filter.hasGroupingTypeRadioGroup ? (
                                <RadioButtonGroup label="Grouping Type">
                                  <RadioButtonGroup.Button
                                    name={`grouping-type-${groupingIndex}-${filterIndex}`}
                                    id={`radio-button-and-${groupingIndex}-${filterIndex}`}
                                    checked={grouping.type === 'AND'}
                                    value="AND"
                                    onChange={() => {
                                      if (grouping.type === 'OR') {
                                        setGroupingType({
                                          groupingType: 'AND',
                                          groupingIndex,
                                        });
                                      }
                                    }}
                                  >
                                    <Uppercase>And</Uppercase>
                                  </RadioButtonGroup.Button>

                                  <RadioButtonGroup.Button
                                    name={`grouping-type-${groupingIndex}-${filterIndex}`}
                                    id={`radio-button-or-${groupingIndex}-${filterIndex}`}
                                    checked={grouping.type === 'OR'}
                                    value="OR"
                                    onChange={() => {
                                      if (grouping.type === 'AND') {
                                        setGroupingType({
                                          groupingIndex,
                                          groupingType: 'OR',
                                        });
                                      }
                                    }}
                                  >
                                    <Uppercase>Or</Uppercase>
                                  </RadioButtonGroup.Button>
                                </RadioButtonGroup>
                              ) : null}

                              {filter.hasAndButton ? (
                                <Box>
                                  <AddButton onClick={() => addFilter({ groupingIndex })}>
                                    <ScreenReaderOnly>Add </ScreenReaderOnly>
                                    <Uppercase>And</Uppercase>
                                    <ScreenReaderOnly>Filter</ScreenReaderOnly>
                                  </AddButton>
                                </Box>
                              ) : null}

                              {filter.hasOrButton ? (
                                <Box>
                                  <AddButton onClick={() => addFilter({ groupingIndex })}>
                                    <ScreenReaderOnly>Add </ScreenReaderOnly>
                                    <Uppercase>Or</Uppercase>
                                    <ScreenReaderOnly> Filter</ScreenReaderOnly>
                                  </AddButton>
                                </Box>
                              ) : null}

                              {filter.hasComparisonBetweenFilters ? (
                                <Comparison>{grouping.type}</Comparison>
                              ) : null}
                            </Stack>

                            {filter.hasRemoveButton ? (
                              <RemoveButton
                                onClick={() => removeFilter({ filterIndex, groupingIndex })}
                              />
                            ) : null}
                          </Box>
                        </Box>
                      );
                    })}
                  </Panel>

                  {grouping.hasAndBetweenGroups ? <Comparison>And</Comparison> : null}
                </Stack>

                {grouping.hasAndButton ? (
                  <Box marginBottom="800" marginTop="500">
                    <AddButton type="grouping" onClick={() => addGrouping()}>
                      <ScreenReaderOnly>Add</ScreenReaderOnly>
                      <Uppercase>And</Uppercase>
                      <ScreenReaderOnly>Grouping</ScreenReaderOnly>
                    </AddButton>
                  </Box>
                ) : null}
              </div>
            );
          })}
        </Stack>

        <Drawer.Footer>
          <Box display="flex">
            <Box pr="100" flex="1">
              <Button width="100%" variant="primary" type="submit">
                Apply Filters
              </Button>
            </Box>
            <Box pl="100" flex="1">
              <Button width="100%" variant="secondary" onClick={() => clearFilters()}>
                Clear Filters
              </Button>
            </Box>
          </Box>
        </Drawer.Footer>
      </Box>
    </form>
  );
}

export default connect(state => ({ typeaheadCache: selectCacheReportBuilder(state) }), {
  fetchMetricsDomains,
  fetchMetricsCampaigns,
  fetchMetricsSendingIps,
  fetchMetricsIpPools,
  fetchMetricsTemplates,
  listSubaccounts,
  listSendingDomains,
})(FiltersForm);
