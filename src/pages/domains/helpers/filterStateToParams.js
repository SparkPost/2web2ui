function filterStateToParams(filtersState) {
  let params = {};

  if (filtersState?.checkboxes) {
    for (let checkbox of filtersState.checkboxes) {
      params[checkbox.name] = checkbox.isChecked;
    }
  }
  if (filtersState?.domainName) {
    params.domainName = filtersState.domainName;
  } else {
    params.domainName = '';
  }

  return params;
}

export default filterStateToParams;
