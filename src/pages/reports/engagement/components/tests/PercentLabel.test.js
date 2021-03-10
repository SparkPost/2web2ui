import React from 'react';
import { shallow } from 'enzyme';
import PercentLabel from '../PercentLabel';

describe('PercentLabel', () => {
  it('renders label', () => {
    const props = {
      percentage: '89.88%',
      width: 200,
      x: 64,
      yAxis: {
        height: 290,
        tickCount: 5,
        y: 25
      }
    };
    const wrapper = shallow(<PercentLabel {...props} />);

    expect(wrapper).toMatchSnapshot();
  });
});
