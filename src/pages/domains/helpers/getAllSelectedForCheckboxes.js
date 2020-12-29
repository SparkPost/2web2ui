const getAllSelectedForCheckboxes = function(checkboxes) {
  const checkboxesWithoutSelectAll = checkboxes
    .map(checkbox => (checkbox.name !== 'selectAll' ? checkbox : undefined))
    .filter(Boolean); // get rid of selectAll

  const allSelected =
    checkboxesWithoutSelectAll.map(checkbox => checkbox.isChecked).filter(Boolean)?.length ===
    checkboxesWithoutSelectAll?.length;

  return allSelected;
};

export default getAllSelectedForCheckboxes;
