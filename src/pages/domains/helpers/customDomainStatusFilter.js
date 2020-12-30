const customDomainStatusFilter = function(rows, columnIds, value) {
  if (!rows || !rows.length) {
    return rows;
  }

  const column = columnIds[0];
  const mappedRows = rows
    .map(row => {
      let trueForStleastOne = 0;
      Object.keys(value).forEach(status => {
        if (value[status] && row.values[column][status]) {
          trueForStleastOne++;
        }
      });
      return trueForStleastOne > 0 ? row : false;
    })
    .filter(Boolean);
  return mappedRows;
};

export default customDomainStatusFilter;
