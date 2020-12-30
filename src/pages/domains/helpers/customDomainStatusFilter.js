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
      let trueForStleastOne = 0;
      Object.keys(appliedFilters).forEach(status => {
        if (status !== 'blocked' && row.values[tableColumnName]['blocked']) return;
        //if a domain is blocked we don't have to compare other fields
        else if (appliedFilters[status] && row.values[tableColumnName][status]) {
          trueForStleastOne++;
          return;
        }
      });
      return trueForStleastOne > 0 ? row : false;
    })
    .filter(Boolean);

  return mappedRows;
};

export default customDomainStatusFilter;
