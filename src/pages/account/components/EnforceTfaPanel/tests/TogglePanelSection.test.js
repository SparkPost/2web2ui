import React from 'react';
import { shallow } from 'enzyme';
import TogglePanelSection from '../TogglePanelSection';

describe('Component: TogglePanel', () => {
  const baseProps = {
    tfaRequired: false,
    toggleTfaRequired: () => {},
  };

  function subject(props) {
    return shallow(<TogglePanelSection {...baseProps} {...props} />);
  }

  it('should reflect tfaRequired', () => {
    expect(
      subject({ tfaRequired: true })
        .find('Toggle')
        .prop('checked'),
    ).toEqual(true);
  });

  it('should call back on toggle', () => {
    const toggleTfaRequired = jest.fn();
    const wrapper = subject({ toggleTfaRequired });
    wrapper.find('Toggle').simulate('change');
    expect(toggleTfaRequired).toHaveBeenCalledTimes(1);
  });

  it('should be disabled if readOnly or tfaEnforced is set to true', () => {
    expect(
      subject({ readOnly: true })
        .find('Toggle')
        .prop('disabled'),
    ).toEqual(true);
    expect(
      subject({ tfaRequiredEnforced: true })
        .find('Toggle')
        .prop('disabled'),
    ).toEqual(true);
  });
});
