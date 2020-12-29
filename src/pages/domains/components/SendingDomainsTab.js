import React, { useEffect, useRef, useReducer } from 'react';
import { useFilters, usePagination, useSortBy, useTable } from 'react-table';
import { ApiErrorBanner, Empty, Loading } from 'src/components';
import { Pagination } from 'src/components/collection';
import { Panel } from 'src/components/matchbox';
import { DEFAULT_CURRENT_PAGE, DEFAULT_PER_PAGE } from 'src/constants';
import { usePageFilters } from 'src/hooks';
import { API_ERROR_MESSAGE } from '../constants';
import useDomains from '../hooks/useDomains';
import SendingDomainsTable from './SendingDomainsTable';
import TableFilters, { reducer as tableFiltersReducer } from './TableFilters';
import {
  getReactTableFilters,
  customDomainStatusFilter,
  getActiveStatusFilters,
  filterStateToParams,
} from '../helpers';

import _ from 'lodash';

const filtersInitialState = {
  domainName: '',
  checkboxes: [
    {
      label: 'Select All',
      name: 'selectAll',
      isChecked: true,
    },
    {
      label: 'Verified',
      name: 'readyForSending',
      isChecked: true,
    },
    {
      label: 'DKIM Signing',
      name: 'readyForDKIM',
      isChecked: true,
    },
    {
      label: 'Bounce',
      name: 'readyForBounce',
      isChecked: true,
    },
    {
      label: 'SPF Valid',
      name: 'validSPF',
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

const initFiltersForSending = {
  domainName: { defaultValue: undefined },
  readyForSending: {
    defaultValue: undefined,
    validate: val => {
      return val === 'true' || val === 'false' || typeof val === 'boolean';
    },
  },
  readyForDKIM: {
    defaultValue: undefined,
    validate: val => {
      return val === 'true' || val === 'false' || typeof val === 'boolean';
    },
  },
  readyForBounce: {
    defaultValue: undefined,
    validate: val => {
      return val === 'true' || val === 'false' || typeof val === 'boolean';
    },
  },
  validSPF: {
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
    label: 'Date Added (Newest - Oldest)',
    value: 'creationTimeDesc',
    'data-sort-by': 'creationTime',
    'data-sort-direction': 'desc',
  },
  {
    label: 'Date Added (Oldest - Newest)',
    value: 'creationTimeAsc',
    'data-sort-by': 'creationTime',
    'data-sort-direction': 'asc',
  },
  {
    label: 'Domain Name (A - Z)',
    value: 'domainNameAsc',
    'data-sort-by': 'domainName',
    'data-sort-direction': 'asc',
  },
  {
    label: 'Domain Name (Z - A)',
    value: 'domainNameDesc',
    'data-sort-by': 'domainName',
    'data-sort-direction': 'desc',
  },
];

export default function SendingDomainsTab({ renderBounceOnly = false }) {
  const {
    listSendingDomains,
    sendingDomains,
    bounceDomains,
    sendingDomainsListError,
    hasSubaccounts,
    subaccounts,
    listPending,
    listSubaccounts,
  } = useDomains();

  const [filtersState, filtersStateDispatch] = useReducer(tableFiltersReducer, filtersInitialState);
  const { filters, updateFilters, resetFilters } = usePageFilters(initFiltersForSending);

  const domains = renderBounceOnly ? bounceDomains : sendingDomains;

  const filter = React.useMemo(() => customDomainStatusFilter, []);

  const data = React.useMemo(() => domains, [domains]);
  const columns = React.useMemo(
    () => [
      {
        Header: 'Blocked',
        accessor: 'blocked',
        filter,
      },
      { Header: 'CreationTime', accessor: 'creationTime' },
      {
        Header: 'DefaultBounceDomain',
        accessor: 'defaultBounceDomain',
        filter,
      },
      { Header: 'DomainName', accessor: 'domainName' },
      {
        Header: 'ReadyForBounce',
        accessor: 'readyForBounce',
        filter,
      },
      {
        Header: 'ReadyForDKIM',
        accessor: 'readyForDKIM',
        filter,
      },
      {
        Header: 'ReadyForSending',
        accessor: 'readyForSending',
        filter,
      },
      { Header: 'SharedWithSubaccounts', accessor: 'sharedWithSubaccounts', canFilter: false },
      { Header: 'SubaccountId', accessor: 'subaccountId', canFilter: false },
      { Header: 'SubaccountName', accessor: 'subaccountName', canFilter: false },
      {
        Header: 'Unverified',
        accessor: 'unverified',
        filter,
      },
      {
        Header: 'ValidSPF',
        accessor: 'validSPF',
        filter,
      },
      {
        Header: 'SelectAll',
        accessor: 'selectAll',
      },
    ],
    [filter],
  );
  const sortBy = React.useMemo(
    () => [
      { id: 'creationTime', desc: true },
      { id: 'domainName', desc: true },
    ],
    [],
  );
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
            id: 'creationTime',
            desc: true,
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

  // resets state when tabs tabs switched from Sending -> Bounce or Bounce -> Sending
  useEffect(() => {
    filtersStateDispatch({ type: 'RESET', state: filtersInitialState });
    resetFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderBounceOnly]);

  // Make initial requests
  useEffect(() => {
    listSendingDomains();
  }, [listSendingDomains]);

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

  if (sendingDomainsListError) {
    return (
      <ApiErrorBanner
        errorDetails={sendingDomainsListError.message}
        message={API_ERROR_MESSAGE}
        reload={() => listSendingDomains()}
      />
    );
  }

  return (
    <>
      <Panel mb="400">
        <Panel.Section>
          <TableFilters>
            <TableFilters.DomainField
              disabled={listPending}
              value={filtersState.domainName}
              onChange={e => {
                filtersStateDispatch({ type: 'DOMAIN_FILTER_CHANGE', value: e.target.value });
              }}
              placeholder={domains.length > 0 ? `e.g. ${domains[0]?.domainName}` : ''}
            />

            <TableFilters.StatusPopover
              disabled={listPending}
              checkboxes={filtersState.checkboxes}
              domainType={renderBounceOnly ? 'bounce' : 'sending'}
              onCheckboxChange={e => {
                filtersStateDispatch({ type: 'TOGGLE', name: e.target.name });
              }}
            />

            <TableFilters.SortSelect
              disabled={listPending}
              defaultValue="creationTime"
              options={options}
              onChange={e => {
                const { currentTarget } = e;
                const selectedOption = _.find(options, { value: currentTarget.value });
                const selectedAttribute = selectedOption['data-sort-by'];
                const selectedDirection = selectedOption['data-sort-direction'];
                const desc = selectedDirection === 'desc' ? true : false;
                toggleSortBy(selectedAttribute, desc);
              }}
            />
          </TableFilters>
        </Panel.Section>

        {listPending && <Loading />}

        {isEmpty && <Empty message="There is no data to display" />}

        {!listPending && !isEmpty && <SendingDomainsTable tableInstance={tableInstance} />}
      </Panel>

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
