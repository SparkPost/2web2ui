import React, { useEffect, useCallback, useRef, useReducer } from 'react';
import { useFilters, usePagination, useSortBy, useTable } from 'react-table';
import { ApiErrorBanner, Empty, Loading } from 'src/components';
import { Pagination } from 'src/components/collection';
import { DEFAULT_CURRENT_PAGE, DEFAULT_PER_PAGE } from 'src/constants';
import { usePageFilters, usePrevious } from 'src/hooks';
import { API_ERROR_MESSAGE } from '../constants';
import useDomains from '../hooks/useDomains';
import SendingDomainsTable from './SendingDomainsTable';
import TableFilters, { reducer as tableFiltersReducer } from './TableFilters';
import {
  getReactTableFilters,
  customDomainStatusFilter,
  getActiveStatusFilters,
  setCheckboxIsChecked,
  filterStateToParams,
} from '../helpers';

import { DomainsListPanel, DomainsListPanelSection } from './styles';

import _ from 'lodash';

// For local reducer state
const filtersInitialState = {
  domainName: '',
  checkboxes: [
    {
      label: 'Select All',
      name: 'selectAll',
      isChecked: false,
    },
    {
      label: 'Verified',
      name: 'readyForSending',
      isChecked: false,
    },
    {
      label: 'DKIM Signing',
      name: 'readyForDKIM',
      isChecked: false,
    },
    {
      label: 'Bounce',
      name: 'readyForBounce',
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

// For URL params
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
    listPending,
  } = useDomains();

  // eslint-disable-next-line no-unused-vars
  const { filters, updateFilters, resetFilters } = usePageFilters(initFiltersForSending);
  const [filtersState, filtersStateDispatch] = useReducer(tableFiltersReducer, filtersInitialState);

  const domains = renderBounceOnly ? bounceDomains : sendingDomains;

  const filter = React.useMemo(() => customDomainStatusFilter, []);

  const data = React.useMemo(() => domains, [domains]);

  const columns = React.useMemo(
    () => [
      { Header: 'CreationTime', accessor: 'creationTime' },
      { Header: 'DomainName', accessor: 'domainName' },
      { Header: 'SharedWithSubaccounts', accessor: 'sharedWithSubaccounts', canFilter: false },
      { Header: 'SubaccountId', accessor: 'subaccountId', canFilter: false },
      { Header: 'SubaccountName', accessor: 'subaccountName', canFilter: false },
      { Header: 'DefaultBounceDomain', accessor: 'defaultBounceDomain', canFilter: false },
      {
        Header: 'DomainStatus',
        accessor: row => ({
          readyForBounce: row.readyForBounce,
          blocked: row.blocked,
          readyForDKIM: row.readyForDKIM,
          readyForSending: row.readyForSending,
          unverified: row.unverified,
        }),
        filter,
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

  const flattenedFilters = filterStateToParams(filtersState);

  const domainStatusValues = {
    blocked: flattenedFilters['blocked'],
    readyForDKIM: flattenedFilters['readyForDKIM'],
    readyForSending: flattenedFilters['readyForSending'],
    unverified: flattenedFilters['unverified'],
  };

  if (!renderBounceOnly) {
    domainStatusValues['readyForBounce'] = flattenedFilters['readyForBounce'];
  }

  const reactTableFilters = getReactTableFilters({
    domainName: flattenedFilters['domainName'],
    DomainStatus: domainStatusValues, // NOTE: DomainStatus is the Header Key for react-table (needs to match)
  });

  const tableInstance = useTable(
    {
      columns,
      data,
      sortBy,
      initialState: {
        pageIndex: DEFAULT_CURRENT_PAGE - 1, // react-table takes a 0 base pageIndex
        pageSize: DEFAULT_PER_PAGE,
        filters: reactTableFilters,
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

  const firstLoad = useRef(true);
  const previousFirstLoad = usePrevious(firstLoad.current);
  // Because we need tab changes from sending and bounce to behave differently
  useEffect(() => {
    if (firstLoad.current || (!firstLoad.current && previousFirstLoad)) {
      return;
    }

    // NOTE: Handles tab changes, ignores page load

    if (Boolean(renderBounceOnly)) {
      filtersInitialState.checkboxes.map(checkbox => {
        checkbox.isChecked = false;
        return checkbox;
      });
      filtersStateDispatch({ type: 'RESET', state: filtersInitialState });
      resetFilters(); // reset url to have no params
    } else {
      const flattenedFilters = filterStateToParams(filtersState);
      const domainStatusValues = {
        blocked: flattenedFilters['blocked'],
        readyForDKIM: flattenedFilters['readyForDKIM'],
        readyForSending: flattenedFilters['readyForSending'],
        unverified: flattenedFilters['unverified'],
      };
      domainStatusValues['readyForBounce'] = flattenedFilters['readyForBounce'];
      const reactTableFilters = getReactTableFilters({
        domainName: flattenedFilters['domainName'],
        DomainStatus: domainStatusValues, // NOTE: DomainStatus is the Header Key for react-table (needs to match)
      });
      setAllFilters(reactTableFilters); // table update
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstLoad.current, renderBounceOnly]);

  // synce query params -> page state on page load, and handle tab switching (sending and bounce)
  useEffect(() => {
    if (!rows || rows.length === 0 || listPending) {
      return;
    }

    // NOTE: Handles page load, ignores tab changes

    if (firstLoad.current) {
      firstLoad.current = false;
      const activeStatusFilters = getActiveStatusFilters(filters);
      const newFiltersState = {
        ...filtersState,
        checkboxes: filtersState.checkboxes.map(checkbox => {
          return {
            ...checkbox,
            isChecked: activeStatusFilters.findIndex(i => i.name === checkbox.name) >= 0,
          };
        }),
      };
      newFiltersState['domainName'] = filters['domainName'];

      filtersStateDispatch({
        type: 'LOAD',
        filtersState: newFiltersState,
      }); // Update domain status filters

      // update url and table
      batchDispatchUrlAndTable(newFiltersState);

      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, listPending]);

  function batchDispatchUrlAndTable(newFiltersState) {
    const flattenedFilters = filterStateToParams(newFiltersState);

    updateFilters(flattenedFilters); // url update

    const domainStatusValues = {
      blocked: flattenedFilters['blocked'],
      readyForDKIM: flattenedFilters['readyForDKIM'],
      readyForSending: flattenedFilters['readyForSending'],
      unverified: flattenedFilters['unverified'],
    };

    if (!renderBounceOnly) {
      domainStatusValues['readyForBounce'] = flattenedFilters['readyForBounce'];
    }

    const reactTableFilters = getReactTableFilters({
      domainName: flattenedFilters['domainName'],
      DomainStatus: domainStatusValues, // NOTE: DomainStatus is the Header Key for react-table (needs to match)
    });

    setAllFilters(reactTableFilters); // table update
  }

  const throttleDomainHandler = useCallback(_.throttle(batchDispatchUrlAndTable, 1000), []);

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
              placeholder={domains.length > 0 ? `e.g. ${domains[0]?.domainName}` : ''}
            />

            <TableFilters.StatusPopover
              disabled={listPending}
              checkboxes={filtersState.checkboxes}
              domainType={renderBounceOnly ? 'bounce' : 'sending'}
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
        </DomainsListPanelSection>

        {listPending && <Loading />}

        {isEmpty && <Empty message="There is no data to display" />}

        {!listPending && !isEmpty && <SendingDomainsTable tableInstance={tableInstance} />}
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
