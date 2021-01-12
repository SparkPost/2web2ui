import React, { useEffect, useCallback, useRef, useReducer } from 'react';
import { useFilters, usePagination, useSortBy, useTable } from 'react-table';
import { ApiErrorBanner, Empty, Loading } from 'src/components';
import { Pagination } from 'src/components/collection';
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

// For usePageFilters
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
  domain: {
    defaultValue: undefined,
  },
  token: {
    defaultValue: undefined,
  },
  mailbox: {
    defaultValue: undefined,
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

  const previousRenderBounceOnly = useRef(renderBounceOnly);
  if (renderBounceOnly !== previousRenderBounceOnly.current) {
    // filtersInitialState -> selectAll was being set to false after first reset... huh...
    filtersInitialState.checkboxes.map(checkbox => {
      checkbox.isChecked = true;
      return checkbox;
    }); // force selectAll true again...
    filtersStateDispatch({ type: 'RESET', state: filtersInitialState });
    resetFilters();
    previousRenderBounceOnly.current = renderBounceOnly; // set previous after dispatching resets
  }

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
      {
        Header: 'DomainStatus',
        accessor: row => ({
          readyForBounce: row.readyForBounce,
          blocked: row.blocked,
          defaultBounceDomain: row.defaultBounceDomain,
          readyForDKIM: row.readyForDKIM,
          readyForSending: row.readyForSending,
          unverified: row.unverified,
          validSPF: row.validSPF,
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

  // synce query params -> page state
  const firstLoad = useRef(true);
  useEffect(() => {
    if (!rows || (rows && rows.length === 0) || listPending) {
      return;
    }

    if (firstLoad.current) {
      const allStatusCheckboxNames = Object.keys(filters).filter(i => i !== 'domainName');
      const activeStatusFilters = getActiveStatusFilters(filters);
      const statusFiltersToApply = !activeStatusFilters.length
        ? allStatusCheckboxNames
        : activeStatusFilters.map(i => i.name);

      firstLoad.current = false;

      const newFiltersState = {
        ...filtersState,
        checkboxes: filtersState.checkboxes.map(checkbox => {
          return {
            ...checkbox,
            isChecked: statusFiltersToApply.indexOf(checkbox.name) >= 0,
          };
        }),
      };
      newFiltersState['domainName'] = filters['domainName'];

      filtersStateDispatch({
        type: 'LOAD',
        filtersState: newFiltersState,
      }); // NOTE: Sets the filters display

      batchDispatchUrlAndTable(newFiltersState);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, listPending]);

  function batchDispatchUrlAndTable(newFiltersState) {
    const flattenedFilters = filterStateToParams(newFiltersState);

    updateFilters(flattenedFilters);

    const domainStatusValues = {
      blocked: flattenedFilters['blocked'],
      readyForDKIM: flattenedFilters['readyForDKIM'],
      readyForSending: flattenedFilters['readyForSending'],
      unverified: flattenedFilters['unverified'],
      validSPF: flattenedFilters['validSPF'],
    };

    if (!renderBounceOnly) {
      domainStatusValues['defaultBounceDomain'] = flattenedFilters['defaultBounceDomain'];
      domainStatusValues['readyForBounce'] = flattenedFilters['readyForBounce'];
    }

    const reactTableFilters = getReactTableFilters({
      domainName: flattenedFilters['domainName'],
      DomainStatus: domainStatusValues, // NOTE: DomainStatus is the Header Key for react-table (needs to match)
    });

    setAllFilters(reactTableFilters);
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
