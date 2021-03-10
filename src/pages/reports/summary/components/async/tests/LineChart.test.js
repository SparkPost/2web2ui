import React from 'react';
import LineChart from '../LineChart';
import { shallow } from 'enzyme';


describe('LineChart', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      syncId: 'summaryChart',
      precision: 'hour',
      showXAxis: true,
      yLabel: 'Count',
      yScale: 'linear',
      data: [
        {
          'count_targeted': 10856,
          'count_rendered': 5637,
          'count_accepted': 9525,
          'count_bounce': 1064,
          'ts': '2018-11-06T10:00:00-05:00'
        }, {
          'count_targeted': 10914,
          'count_rendered': 5628,
          'count_accepted': 9428,
          'count_bounce': 1143,
          'ts': '2018-11-06T11:00:00-05:00'
        }
      ]
    };

    wrapper = shallow(<LineChart {...props} />);
  });

  it('should render', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
