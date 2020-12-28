import React, { useEffect, useRef, useReducer } from 'react';
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
  getActiveStatusFilters,
  filterStateToParams,
} from '../helpers';
import { DomainsPanel, DomainsPanelSection } from './styles';
import _ from 'lodash';

const filtersInitialState = {
  domainName: undefined,
  checkboxes: [
    {
      label: 'Select All',
      name: 'selectAll',
      isChecked: true,
    },
    {
      label: 'Verified',
      name: 'verified',
      isChecked: true,
    },
    {
      label: 'Unverified',
      name: 'unverified',
      isChecked: true,
    },
    {
      label: 'Blocked',
      name: 'blocked',
      isChecked: true,
    },
  ],
};

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
    hasSubaccounts,
    listSubaccounts,
    subaccounts,
    trackingDomains,
    trackingDomainsListError,
  } = useDomains();

  const [filtersState, filtersStateDispatch] = useReducer(tableFiltersReducer, filtersInitialState);
  const { filters, updateFilters } = usePageFilters(initFiltersForTracking);

  const filter = React.useMemo(() => customDomainStatusFilter, []);
  const data = React.useMemo(() => trackingDomains, [trackingDomains]);
  const columns = React.useMemo(
    () => [
      {
        Header: 'Blocked',
        accessor: 'blocked',
        filter,
      },
      { Header: 'DefaultTrackingDomain', accessor: 'defaultTrackingDomain' },
      { Header: 'DomainName', accessor: 'domainName' },
      { Header: 'SharedWithSubaccounts', accessor: 'sharedWithSubaccounts' },
      { Header: 'SubaccountId', accessor: 'subaccountId' },
      { Header: 'SubaccountName', accessor: 'subaccountName' },
      {
        Header: 'Unverified',
        accessor: 'unverified',
        filter,
      },
      {
        Header: 'Verified',
        accessor: 'verified',
        filter,
      },
      {
        Header: 'SelectAll',
        accessor: 'selectAll',
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

  // Make initial requests
  useEffect(() => {
    listTrackingDomains();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (hasSubaccounts && subaccounts?.length === 0) {
      listSubaccounts();
    }
  }, [hasSubaccounts, listSubaccounts, subaccounts]);

  const firstLoad = useRef(true);
  useEffect(() => {
    if (!listPending) {
      const allStatusFilterNames = Object.keys(filters).filter(i => i !== 'domainName');
      const activeStatusFilters = getActiveStatusFilters(filters);
      const statusFiltersToApply = !activeStatusFilters.length
        ? allStatusFilterNames
        : activeStatusFilters.map(i => i.name);
      const domainNameFilter = filters['domainName'];

      if (firstLoad.current) {
        firstLoad.current = false;

        filtersStateDispatch({
          type: 'LOAD',
          names: statusFiltersToApply,
          domainName: domainNameFilter,
        });

        setAllFilters(getReactTableFilters(filterStateToParams(filtersState)));

        return;
      }

      updateFilters(filterStateToParams(filtersState));
      setAllFilters(getReactTableFilters(filterStateToParams(filtersState)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersState, listPending]);

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
      <DomainsPanel mb="400">
        <DomainsPanelSection>
          <TableFilters>
            <TableFilters.DomainField
              disabled={listPending}
              value={filtersState.domainName}
              onChange={e => {
                filtersStateDispatch({ type: 'DOMAIN_FILTER_CHANGE', value: e.target.value });
              }}
              placeholder={
                trackingDomains.length > 0 ? `e.g. ${trackingDomains[0]?.domainName}` : ''
              }
            />

            <TableFilters.StatusPopover
              disabled={listPending}
              checkboxes={filtersState.checkboxes}
              onCheckboxChange={e => {
                filtersStateDispatch({ type: 'TOGGLE', name: e.target.name });
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
        </DomainsPanelSection>

        {listPending && <Loading />}

        {isEmpty && <Empty message="There is no data to display" />}

        {!listPending && !isEmpty && <TrackingDomainsTable tableInstance={tableInstance} />}
      </DomainsPanel>

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
