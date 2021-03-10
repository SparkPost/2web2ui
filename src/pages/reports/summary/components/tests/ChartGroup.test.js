import React from 'react';
import { shallow } from 'enzyme';
import ChartGroup from '../ChartGroup';
import * as chartHelpers from 'src/helpers/chart';

jest.mock('src/helpers/chart');

describe('Component: Summary Chart Group', () => {

  let wrapper;
  let props;

  beforeEach(() => {
    chartHelpers.getLineChartFormatters = jest.fn(() => ({ formatter: 'mock' }));
    chartHelpers.getDayLines = jest.fn(() => [{ ts: 'day lines mock' }]);
    props = {
      chartData: [1, 2, 3],
      precision: 'day',
      metrics: [
        { name: 'a', label: 'a', stroke: 'a' }
      ],
      chartLoading: false,
      yScale: 'linear'
    };
    wrapper = shallow(<ChartGroup {...props} />);
  });

  it('should render', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should render when loading', () => {
    wrapper.setProps({ chartLoading: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render null if no chart data', () => {
    wrapper.setProps({ chartData: []});
    expect(wrapper).toMatchSnapshot();
  });

  it('should render null if no metrics given', () => {
    wrapper.setProps({ metrics: undefined });
    expect(wrapper).toMatchSnapshot();
  });

});
