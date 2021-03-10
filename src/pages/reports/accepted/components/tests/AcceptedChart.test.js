import React from 'react';
import { AcceptedChartClassComponent as AcceptedChart } from '../AcceptedChart';
import { PieChart } from 'src/components';

import { shallow } from 'enzyme';

describe('Accepted ChartGroup: ', () => {
  const props = {
    attempts: [
      { name: 'first attempt', count: 5 },
      {
        name: '2 or more attempts',
        count: 1,
        children: [
          { name: '2-4', count: 2 },
          { name: '5+', count: 3 },
        ],
      },
    ],
    aggregates: {
      count_targeted: 100,
      count_accepted: 50,
      count_sent: 80,
    },
  };

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<AcceptedChart {...props} />);
  });

  it('should render', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should render loading', () => {
    wrapper.setProps({ loading: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should handle mouse in and out', () => {
    wrapper.instance().handleMouseOver(props.attempts[0]);
    wrapper.update();
    expect(wrapper.instance().state).toMatchSnapshot();
    expect(wrapper.find(PieChart.ActiveLabel)).toMatchSnapshot();

    wrapper.instance().handleMouseOut();
    wrapper.update();
    expect(wrapper.find(PieChart.ActiveLabel)).toMatchSnapshot();
    expect(wrapper.instance().state).toMatchSnapshot();
  });

  it('should render label when hovering over a child', () => {
    wrapper.instance().handleClick(props.attempts[1]);
    wrapper.instance().handleMouseOver({ name: '2-4', count: 2 });
    wrapper.update();
    expect(wrapper.find(PieChart.ActiveLabel)).toMatchSnapshot();
  });

  it('should render correctly after click', () => {
    wrapper.instance().handleClick(props.attempts[1]);
    wrapper.update();
    expect(wrapper.find(PieChart.Legend)).toMatchSnapshot();
    expect(wrapper.find(PieChart.Chart)).toMatchSnapshot();
  });

  it('should not do anything if clicking on an item without children', () => {
    wrapper.instance().handleClick(props.attempts[0]);
    expect(wrapper.instance().state).toMatchSnapshot();
  });

  it('should handle breadcrumb', () => {
    wrapper.instance().handleClick(props.attempts[1]);
    expect(wrapper.instance().state).toMatchSnapshot();
    wrapper.instance().handleBreadcrumb();
    expect(wrapper.instance().state).toMatchSnapshot();
  });
});
