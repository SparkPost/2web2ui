import React from 'react';
import { Checkbox } from 'src/components/matchbox';

export default function CheckboxWrapper(props) {
  const { name, setValue, value, ...rest } = props;

  const handleChange = e => {
    setValue(name, e.target.checked);
  };

  return <Checkbox {...rest} name={name} onChange={handleChange} defaultChecked={Boolean(value)} />;
}
