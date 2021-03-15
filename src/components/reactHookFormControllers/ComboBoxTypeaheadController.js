import React, { useEffect, useState } from 'react';
import { ComboBoxTypeahead } from 'src/components/typeahead/ComboBoxTypeahead';

export function ComboBoxTypeaheadController(props) {
  const { name, setValue, value = [], ...rest } = props;
  const [componentValue, setComponentValue] = useState(value);
  const handleChange = e => {
    setComponentValue(e);
  };
  useEffect(() => {
    if (value !== componentValue) {
      setValue(name, componentValue, { shouldValidate: true, shouldDirty: true });
    }
  }, [name, componentValue, value, setValue]);

  return <ComboBoxTypeahead {...rest} name={name} onChange={handleChange} value={componentValue} />;
}
