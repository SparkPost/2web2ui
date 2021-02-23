import React, { useState } from 'react';
import { LoadingSVG } from 'src/components';
import { Button, TextField } from 'src/components/matchbox';
import _ from 'lodash';

const PromoCodeNew = ({ promoCodeObj, handlePromoCode, disabled }) => {
  const { applyPromoCode, clearPromoCode } = handlePromoCode;
  const { promoError, promoPending, selectedPromo } = promoCodeObj;
  const [promoCode, setPromoCode] = useState(selectedPromo.promoCode || '');
  const handleChange = event => {
    setPromoCode(event.target.value);
  };
  const handleClick = () => {
    applyPromoCode(promoCode);
  };
  const renderActionButton = condition => {
    if (condition) {
      return (
        <Button variant="connected" onClick={clearPromoCode} disabled={disabled}>
          Remove
        </Button>
      );
    }
    return (
      <Button variant="connected" onClick={handleClick} disabled={promoPending || disabled}>
        Apply
      </Button>
    );
  };
  const renderLoading = condition => (condition ? <LoadingSVG size="XSmall" /> : null);
  const isDisabled = () => promoPending || _.has(selectedPromo, 'promoCode') || disabled;
  const displayErrorMessage = () => (promoError ? promoError.message : '');

  return (
    <TextField
      id="promo-code"
      name="promo"
      label="Promo Code"
      disabled={isDisabled()}
      connectRight={renderActionButton(selectedPromo.promoCode)}
      onChange={handleChange}
      suffix={renderLoading(promoPending)}
      error={displayErrorMessage()}
      defaultValue={selectedPromo.promoCode || ''}
    />
  );
};

export default PromoCodeNew;
