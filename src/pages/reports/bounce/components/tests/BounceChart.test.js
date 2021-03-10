import React from 'react';
import BounceChart from '../BounceChart';
import { PieChart } from 'src/components';

import { shallow } from 'enzyme';

describe('Bounce Chart', () => {
  const props = {
    categories: [
      { name: 'hard', count: 5 },
      { name: 'soft', count: 1, children: [{ name: 'softchild1', count: 2 }, { name: 'softchild2', count: 3 }]}
    ],
    admin: [
      { name: 'admin failure', count: 5 },
      { name: 'smart send', count: 1 }
    ],
    types: [
      { name: 'in', count: 20 },
      { name: 'out', count: 30 }
    ],
    aggregates: {
      countSent: 100,
      countBounce: 50,
      countAdminBounce: 10,
      countTargeted: 60
    },
    tab: 0
  };

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<BounceChart {...props} />);
  });

  it('should render', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should render loading', () => {
    wrapper.setProps({ loading: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should handle mouse in and out', () => {
    wrapper.instance().handleMouseOver(props.types[0], 'secondary');
    wrapper.update();
    expect(wrapper.instance().state).toMatchSnapshot();
    expect(wrapper.find(PieChart.ActiveLabel)).toMatchSnapshot();

    wrapper.instance().handleMouseOut();
    wrapper.update();
    expect(wrapper.find(PieChart.ActiveLabel)).toMatchSnapshot();
    expect(wrapper.instance().state).toMatchSnapshot();

    wrapper.setProps({ tab: 1 });
    wrapper.instance().handleMouseOver({ name: 'Admin Failure', count: 2 });
    wrapper.update();
    expect(wrapper.find(PieChart.ActiveLabel)).toMatchSnapshot();
    expect(wrapper.instance().state).toMatchSnapshot();
  });

  it('should render label when hovering over a child', () => {
    wrapper.instance().handleClick(props.categories[1]);
    wrapper.instance().handleMouseOver({ name: 'softchild1', count: 2 }, 'primary');
    wrapper.update();
    expect(wrapper.find(PieChart.ActiveLabel)).toMatchSnapshot();
  });

  it('should render correctly after click', () => {
    wrapper.instance().handleClick(props.categories[1]);
    wrapper.update();
    expect(wrapper.find(PieChart.Legend)).toMatchSnapshot();
    expect(wrapper.find(PieChart.Chart)).toMatchSnapshot();
  });

  it('should not do anything if clicking on an item without children', () => {
    wrapper.instance().handleClick(props.types[0]);
    expect(wrapper.instance().state).toMatchSnapshot();
  });

  it('should handle breadcrumb', () => {
    wrapper.instance().handleClick(props.categories[1]);
    expect(wrapper.instance().state).toMatchSnapshot();
    wrapper.instance().handleBreadcrumb();
    expect(wrapper.instance().state).toMatchSnapshot();
  });

  it('should switch legends when clicking on admin tab even when children data is in bounce tab', () => {
    wrapper.instance().handleClick(props.categories[1]);
    wrapper.setProps({ tab: 1 });
    wrapper.update();
    expect(wrapper.find(PieChart.Legend)).toMatchSnapshot();
  });

  it('should render bounces chart when on bounces tab', () => {
    wrapper.setProps({ tab: 0 });
    wrapper.update();
    expect(wrapper.find(PieChart.Chart)).toMatchSnapshot();
  });

  it('should render admin bounces chart when on admin bounces tab', () => {
    wrapper.setProps({ tab: 1 });
    wrapper.update();
    expect(wrapper.find(PieChart.Chart)).toMatchSnapshot();
  });
});
