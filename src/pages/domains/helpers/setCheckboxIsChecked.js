const setCheckboxIsChecked = function(name, checkboxes) {
  return checkboxes.map(checkbox => {
    if (name === 'selectAll') {
      return {
        ...checkbox,
        isChecked: true,
      };
    }

    if (checkbox.name === name) {
      return {
        ...checkbox,
        isChecked: !checkbox.isChecked,
      };
    }

    return checkbox;
  });
};

export default setCheckboxIsChecked;
