import { mount } from 'enzyme';
import React from 'react';
import moment from 'moment';
import { TimezoneTypeahead, timeZoneOptions } from '../TimezoneTypeahead';
import TestApp from 'src/__testHelpers__/TestApp';

describe('Timezone Typeahead Item', () => {
  const subject = props =>
    mount(
      <TestApp>
        <TimezoneTypeahead {...props} />
      </TestApp>,
    );
  beforeEach(() => {
    moment.tz.setDefault('America/New_York');
  });

  // This includes a long list of options, but it's actually helpful to see a difference
  // when/if we update moment/moment-timezone which options might change
  it('should render the timezone list properly', () => {
    const wrapper = subject();
    expect(wrapper.find('Typeahead').prop('results')).toMatchSnapshot();
  });

  it('should should select the first timezone (UTC) as the default', () => {
    const wrapper = subject();
    expect(wrapper.find('Typeahead').prop('selectedItem')).toEqual({
      value: 'UTC',
      label: 'UTC',
    });
  });

  it('if initialValue is set, it should select that as the default', () => {
    const wrapper = subject({ initialValue: 'Pacific/Chatham' });

    expect(wrapper.find('Typeahead').prop('selectedItem')).toEqual(
      timeZoneOptions.find(timeZone => timeZone.value === 'Pacific/Chatham'),
    );
  });

  it('if isForcedUTC is set, it should set timezone to UTC in onChange ', () => {
    const onChange = jest.fn();
    subject({ initialValue: 'Pacific/Chatham', onChange, isForcedUTC: true });

    expect(onChange).toBeCalledWith({
      label: 'UTC',
      value: 'UTC',
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
      value: 'UTC',
    });

    expect(typeahead.prop('disabled')).toBe(true);
  });
});
