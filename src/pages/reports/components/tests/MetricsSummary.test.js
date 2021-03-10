import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import { MetricsSummary } from '../MetricsSummary';
import styles from '../MetricsSummary.module.scss';

jest.mock('src/hooks/useHibanaOverride');

const props = {
  rateValue: 10,
  rateTitle: 'Summary Title',
  to: moment('2018-01-12T12:00').toDate(),
  from: moment('2017-12-25T05:30').toDate(),
};

describe('MetricsSummary: ', () => {
  useHibanaOverride.mockReturnValue(styles);

  it('should render custom date', () => {
    const wrapper = shallow(
      <MetricsSummary {...props} relativeRange="custom">
        <p>message</p>
      </MetricsSummary>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render relative range', () => {
    const wrapper = shallow(
      <MetricsSummary {...props} relativeRange="30days">
        <p>message</p>
      </MetricsSummary>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render secondary message', () => {
    const wrapper = shallow(
      <MetricsSummary {...props} relativeRange="custom" secondaryMessage="another message">
        <p>message</p>
      </MetricsSummary>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
