import React from 'react';
import { mount } from 'enzyme';
import { TimezoneTypeahead } from '../TimezoneTypeahead';
import TestApp from 'src/__testHelpers__/TestApp';

const MOCK_TIMEZONE_OPTIONS = [
  {
    label: 'My Time Zone',
    value: 'my/timezone',
  },
  {
    label: 'Another Time Zone',
    value: 'another/timezone',
  },
];

describe('TimezoneTypeahead', () => {
  const subject = props =>
    mount(
      <TestApp>
        <TimezoneTypeahead options={MOCK_TIMEZONE_OPTIONS} {...props} />
      </TestApp>,
    );

  it('should should select the first timezone as the default', () => {
    const wrapper = subject();
    expect(wrapper.find('Typeahead').prop('selectedItem')).toEqual(MOCK_TIMEZONE_OPTIONS[0]);
  });

  it('defaults the selected item according to the `initialValue` prop', () => {
    const wrapper = subject({ initialValue: 'another/timezone' });
    const selectedValue = wrapper.find('Typeahead').prop('selectedItem');

    expect(selectedValue).toEqual({
      label: 'Another Time Zone',
      value: 'another/timezone',
    });
  });

  it('if isForcedUTC is set, it should set timezone to UTC in onChange ', () => {
    const onChange = jest.fn();
    subject({ initialValue: 'Pacific/Chatham', onChange, isForcedUTC: true });

    expect(onChange).toBeCalledWith({
      label: 'UTC',
      value: 'Etc/UTC',
    });
  });

  it('if isForcedUTC is not set, it should not call the onChange', () => {
    const onChange = jest.fn();

    subject({ initialValue: 'Pacific/Chatham', onChange, isForcedUTC: false });

    expect(onChange).not.toBeCalled();
  });

  it('if disabledAndUTCOnly is set, it should be disabled and have UTC value', () => {
    const wrapper = subject({ initialValue: 'Pacific/Chatham', disabledAndUTCOnly: true });

    const typeahead = wrapper.find('Typeahead');

    expect(typeahead.prop('selectedItem')).toEqual({
      label: 'UTC',
      value: 'Etc/UTC',
    });

    expect(typeahead.prop('disabled')).toBe(true);
  });
});
