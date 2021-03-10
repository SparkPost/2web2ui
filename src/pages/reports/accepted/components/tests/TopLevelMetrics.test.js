import React from 'react';
import TopLevelMetrics from '../TopLevelMetrics';
import { shallow } from 'enzyme';

const props = {
  aggregates: {
    count_targeted: 200,
    count_accepted: 150,
    count_sent: 160,
    avg_delivery_time_first: 100,
    avg_delivery_time_subsequent: 100,
    avg_msg_size: 10
  },
  filters: {
    relativeRange: 'hour'
  },
  metrics: [
    { key: 'avg_delivery_time_first', description: 'a' },
    { key: 'avg_delivery_time_subsequent', description: 'b' },
    { key: 'avg_msg_size', description: 'c' }
  ]
};

describe('Accepted TopLevelMetrics Component: ', () => {

  // This is a presentational component that assumes all props are available
  // Loading state handled in parent
  it('should render correctly', () => {
    const wrapper = shallow(<TopLevelMetrics {...props}/>);
    expect(wrapper).toMatchSnapshot();
  });
});
