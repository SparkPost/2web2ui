import React, { useCallback, useReducer } from 'react';
import { useFilters, usePagination, useSortBy, useTable } from 'react-table';
import { ApiErrorBanner, Empty, Loading } from 'src/components';
import { Pagination } from 'src/components/collection';
import { DEFAULT_CURRENT_PAGE, DEFAULT_PER_PAGE } from 'src/constants';
import { usePageFilters } from 'src/hooks';
import { API_ERROR_MESSAGE } from '../constants';
import useDomains from '../hooks/useDomains';
import TableFilters, { reducer as tableFiltersReducer } from './TableFilters';
import TrackingDomainsTable from './TrackingDomainsTable';
import {
  getReactTableFilters,
  customDomainStatusFilter,
  setCheckboxIsChecked,
  filterStateToParams,
} from '../helpers';

import { DomainsListPanel, DomainsListPanelSection } from './styles';

import _ from 'lodash';

// For local reducer state
const filtersInitialState = {
  domainName: undefined,
  checkboxes: [
    {
      label: 'Select All',
      name: 'selectAll',
      isChecked: false,
    },
    {
      label: 'Verified',
      name: 'verified',
      isChecked: false,
    },
    {
      label: 'Unverified',
      name: 'unverified',
      isChecked: false,
    },
    {
      label: 'Blocked',
      name: 'blocked',
      isChecked: false,
    },
  ],
};

// For usePageFilters
const initFiltersForTracking = {
  domainName: { defaultValue: undefined },
  verified: {
    defaultValue: undefined,
    validate: val => {
      return val === 'true' || val === 'false' || typeof val === 'boolean';
    },
  },
  unverified: {
    defaultValue: undefined,
    validate: val => {
      return val === 'true' || val === 'false' || typeof val === 'boolean';
    },
  },
  blocked: {
    defaultValue: undefined,
    validate: val => {
      return val === 'true' || val === 'false' || typeof val === 'boolean';
    },
  },
  selectAll: {
    defaultValue: undefined,
    validate: val => {
      return val === 'true' || val === 'false' || typeof val === 'boolean';
    },
  },
};

const options = [
  {
    label: 'Domain Name (A - Z)',
    value: 'domainNameAsc',
    'data-sort-direction': 'asc',
  },
  {
    label: 'Domain Name (Z - A)',
    value: 'domainNameDesc',
    'data-sort-direction': 'desc',
  },
];

export default function TrackingDomainsTab() {
  const {
    listTrackingDomains,
    listPending,
    trackingDomains,
    trackingDomainsListError,
  } = useDomains();

  // TODO: Persist the selection
  // eslint-disable-next-line no-unused-vars
  const { filters, updateFilters } = usePageFilters(initFiltersForTracking);
  const [filtersState, filtersStateDispatch] = useReducer(tableFiltersReducer, filtersInitialState);

  const filter = React.useMemo(() => customDomainStatusFilter, []);
  const data = React.useMemo(() => trackingDomains, [trackingDomains]);
  const columns = React.useMemo(
    () => [
      { Header: 'DefaultTrackingDomain', accessor: 'defaultTrackingDomain' },
      { Header: 'DomainName', accessor: 'domainName' },
      { Header: 'SharedWithSubaccounts', accessor: 'sharedWithSubaccounts' },
      { Header: 'SubaccountId', accessor: 'subaccountId' },
      { Header: 'SubaccountName', accessor: 'subaccountName' },
      {
        Header: 'DomainStatus',
        accessor: row => ({
          blocked: row.blocked,
          defaultTrackingDomain: row.defaultTrackingDomain,
          unverified: row.unverified,
          verified: row.verified,
        }),
        filter,
      },
    ],
    [filter],
  );

  const sortBy = React.useMemo(() => [{ id: 'domainName', desc: false }], []);
  const tableInstance = useTable(
    {
      columns,
      data,
      sortBy,
      initialState: {
        pageIndex: DEFAULT_CURRENT_PAGE - 1, // react-table takes a 0 base pageIndex
        pageSize: DEFAULT_PER_PAGE,
        filters: [],
        sortBy: [
          {
            id: 'domainName',
            desc: false,
          },
        ],
      },
    },
    useFilters,
    useSortBy,
    usePagination,
  );
  const { rows, setAllFilters, toggleSortBy, state, gotoPage, setPageSize } = tableInstance;

  const isEmpty = !listPending && rows?.length === 0;

  function batchDispatchUrlAndTable(newFiltersState) {
    const flattenedFilters = filterStateToParams(newFiltersState);

    updateFilters(flattenedFilters);

    const domainStatusValues = {
      blocked: flattenedFilters['blocked'],
      defaultTrackingDomain: flattenedFilters['defaultTrackingDomain'],
      unverified: flattenedFilters['unverified'],
      verified: flattenedFilters['verified'],
    };

    const reactTableFilters = getReactTableFilters({
      domainName: flattenedFilters['domainName'],
      DomainStatus: domainStatusValues,
    });

    setAllFilters(reactTableFilters);
  }

  const throttleDomainHandler = useCallback(_.throttle(batchDispatchUrlAndTable, 1000), []);

  if (trackingDomainsListError) {
    return (
      <ApiErrorBanner
        errorDetails={trackingDomainsListError.message}
        message={API_ERROR_MESSAGE}
        reload={() => listTrackingDomains()}
      />
    );
  }

  return (
    <>
      <DomainsListPanel mb="400">
        <DomainsListPanelSection>
          <TableFilters>
            <TableFilters.DomainField
              disabled={listPending}
              value={filtersState.domainName}
              onChange={e => {
                const newFiltersState = {
                  ...filtersState,
                  domainName: e.target.value,
                };
                filtersStateDispatch({ type: 'DOMAIN_FILTER_CHANGE', value: e.target.value }); // NOTE: Updates the text input
                throttleDomainHandler(newFiltersState);
              }}
              placeholder={
                trackingDomains.length > 0 ? `e.g. ${trackingDomains[0]?.domainName}` : ''
              }
            />

            <TableFilters.StatusPopover
              disabled={listPending}
              checkboxes={filtersState.checkboxes}
              onCheckboxChange={e => {
                const newCheckboxes = setCheckboxIsChecked(e.target.name, filtersState.checkboxes);
                const newFiltersState = {
                  ...filtersState,
                  checkboxes: newCheckboxes,
                };
                filtersStateDispatch({ type: 'TOGGLE', name: e.target.name }); // NOTE: updates checkbox state
                batchDispatchUrlAndTable(newFiltersState);
              }}
            />

            <TableFilters.SortSelect
              disabled={listPending}
              defaultValue="domainName"
              options={options}
              onChange={e => {
                const { currentTarget } = e;
                const selectedOption = _.find(options, { value: currentTarget.value });
                const selectedDirection = selectedOption['data-sort-direction'];
                const desc = selectedDirection === 'desc' ? true : false;
                toggleSortBy('domainName', desc);
              }}
            />
          </TableFilters>
        </DomainsListPanelSection>

        {listPending && <Loading />}

        {isEmpty && <Empty message="There is no data to display" />}

        {!listPending && !isEmpty && <TrackingDomainsTable tableInstance={tableInstance} />}
      </DomainsListPanel>

      <Pagination
        data={rows}
        currentPage={state.pageIndex + 1}
        perPage={state.pageSize}
        saveCsv={false}
        onPageChange={page => gotoPage(page)}
        onPerPageChange={perPage => setPageSize(perPage)}
      />
    </>
  );
}
