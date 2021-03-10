import React, { useEffect } from 'react';

import { getPrecisionOptions, roundBoundaries, getRollupPrecision } from 'src/helpers/metrics';
import { Select } from 'src/components/matchbox';
import useUniqueId from 'src/hooks/useUniqueId';
import moment from 'moment';

const PrecisionSelector = ({ from, to, changeTime, selectedPrecision, disabled }) => {
  const precisionOptions = getPrecisionOptions(moment(from), moment(to));
  const uniqueId = useUniqueId('precision-selector');

  useEffect(() => {
    if (from && to && selectedPrecision) {
      const updatedPrecision = getRollupPrecision({ from, to, precision: selectedPrecision });
      if (updatedPrecision !== selectedPrecision) {
        //Bug showed up during unit tests, wasn't showing up in actual page though.
        changeTime({ precision: updatedPrecision });
      }
    }
  }, [changeTime, from, precisionOptions, selectedPrecision, to]);

  const updatePrecision = ({ currentTarget: { value: precision } }) => {
    const { from: roundedFrom, to: roundedTo } = roundBoundaries({ from, to, precision });

    changeTime({ from: roundedFrom.toDate(), to: roundedTo.toDate(), precision });
  };

  return (
    <Select
      id={uniqueId}
      data-id="precision-selector"
      options={precisionOptions}
      onChange={updatePrecision}
      value={selectedPrecision}
      label="Precision"
      disabled={disabled}
    />
  );
};

export default PrecisionSelector;
