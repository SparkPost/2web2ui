import React from 'react';
import { shallow } from 'enzyme';
import { Legend } from '../Legend';
import getConfig from 'src/helpers/getConfig';

jest.mock('src/helpers/getConfig');

describe('Component: Summary Chart Legend', () => {
  beforeEach(() => {
    getConfig.mockReturnValue([
      {
        recommended: 60 * 4,
        min: 0,
        max: 60 * 12,
        value: '1min',
        format: 'ha',
        uniqueLabel: 'per minute',
      },
      {
        recommended: 60 * 24 * 10,
        min: 60 * 2,
        max: 60 * 24 * 30,
        value: 'hour',
        format: 'ha',
        uniqueLabel: 'per hour',
      },
      {
        recommended: Infinity,
        min: 60 * 24 * 30,
        max: Infinity,
        value: 'month',
        format: 'MMM YY',
        uniqueLabel: 'per day',
      },
    ]);
  });

  const subject = props => {
    const defaults = {
      metrics: [
        { name: 'count_a', label: 'A', stroke: '#aaa' },
        { name: 'count_b', label: 'B', stroke: '#bbb' },
        { name: 'count_c', label: 'C', stroke: '#ccc', isUniquePerTimePeriod: true },
      ],
      reportOptions: {
        precision: '1min',
      },
    };
    return shallow(<Legend {...defaults} {...props} />);
  };

  it('should render using "per minute" labels for unique metrics for 1min precision', () => {
    const wrapper = subject();
    expect(wrapper).not.toHaveTextContent('B per minute');
    expect(wrapper).toHaveTextContent('C per minute');
  });

  it('should render using "per hour" labels for unique metrics for hour precision', () => {
    const wrapper = subject({
      reportOptions: {
        precision: 'hour',
      },
    });
    expect(wrapper).toHaveTextContent('C per hour');
  });

  it('should render using "per day" labels for unique metrics for month precision', () => {
    const wrapper = subject({
      reportOptions: {
        precision: 'month',
      },
    });
    expect(wrapper).toHaveTextContent('C per day');
  });
});
