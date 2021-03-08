import React from 'react';
import { shallow } from 'enzyme';
import FormatRow from '../FormatRow';

describe('FormatRow', () => {
  const subject = (props = {}) =>
    shallow(
      <FormatRow
        batch_id="8c4b19fb-07a2-42cb-84f7-3ab09a8049e0"
        expiration_timestamp="2019-09-29T00:00:00.000Z"
        number_duplicates={0}
        number_failed={0}
        number_succeeded={1}
        timestamp="2019-09-18T20:09:38.000Z"
        type="success"
        {...props}
      />,
    );

  it('renders a row', () => {
    expect(subject()).toMatchSnapshot();
  });

  it('renders a row with validation error', () => {
    const wrapper = subject({
      error_type: 'validation',
      number_failed: 1234,
      type: 'error',
    });

    expect(wrapper).toMatchSnapshot();
  });
});
