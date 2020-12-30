/**
 * @param {*} rows The rows of data to compare against and filter down
 * @param {*} columnIds The names of the table column (set when configuring react-table)
 * @param {*} value What the user set their domain status filters to
 */
const customDomainStatusFilter = function(rows, columnIds, value) {
  const appliedFilters = value;
  const tableColumnName = columnIds[0];
  const mappedRows = rows
    .map(row => {
      let atLeastOneIsFilteredOut = 0;
      Object.keys(value).forEach(status => {
        if (status !== 'blocked' && row.values[tableColumnName]['blocked']) return; // blocked gets filtered out regardless of other applied filters
        if (status !== 'unverified' && row.values[tableColumnName]['unverified']) return; // unverified gets filtered out regardless of other applied filters

        // When verified (readyForSending) gets filtered out, we still need to consider the other filters applied
        if (status === 'readyForSending' && !appliedFilters[status]) {
          if (row.values[tableColumnName]['readyForDKIM']) return;
          if (row.values[tableColumnName]['readyForBounce']) return;
          if (row.values[tableColumnName]['validSPF']) return;
          atLeastOneIsFilteredOut++;
        } else if (!appliedFilters[status] && row.values[tableColumnName][status]) {
          atLeastOneIsFilteredOut++;
        }
      });

      return atLeastOneIsFilteredOut ? undefined : row;
    })
    .filter(Boolean);

  return mappedRows;
};

export default customDomainStatusFilter;
