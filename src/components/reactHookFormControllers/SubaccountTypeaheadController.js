import React from 'react';
import { useController } from 'react-hook-form';
import { SubaccountTypeahead } from 'src/components/typeahead';

export function SubaccountTypeaheadController({
  control,
  name,
  rules = {},
  defaultValue = '',
  helpText,
  disabled,
  id,
}) {
  const {
    field: { ref, value, ...inputProps },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  return (
    <SubaccountTypeahead
      {...inputProps}
      id={id}
      helpText={helpText}
      disabled={disabled}
      selectedItem={value}
      ref={ref}
    />
  );
}
