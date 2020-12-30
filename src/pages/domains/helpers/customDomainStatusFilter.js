const customDomainStatusFilter = function(rows, columnIds, value) {
  const column = columnIds[0];
  return rows
    .map(row => {
      let atleastOneTrue = 0;
      Object.keys(value).forEach(status => {
        // QUESTION: Do we really need to call out these fields? or can we keep it generic?
        if (status !== 'blocked' && row.values[column]['blocked']) return;
        //if a domain is blocked we don't have to compare other fields
        else if (value[status] && row.values[column][status]) {
          atleastOneTrue++;
          return;
        }
      });

      // QUESTION: CAN WE REVERSE THE LOGIC -> MAKE IT RETURN TRUE...?
      return atleastOneTrue > 0 ? row : false;
    })
    .filter(Boolean);
};

export default customDomainStatusFilter;
