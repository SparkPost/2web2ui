import React from 'react';
import { shallow } from 'enzyme';
import ChartHeader from '../ChartHeader';

describe('Component: Summary Chart Header', () => {

  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      onScaleClick: jest.fn(),
      selectedScale: 'linear',
      onTimeClick: jest.fn(),
      selectedTime: 'real',
      selectedMetrics: ['metric-1'],
      onMetricsToggle: jest.fn()
    };
    wrapper = shallow(<ChartHeader {...props} />);
  });

  it('should render', () => {
    expect(wrapper).toMatchSnapshot();
  });

});
