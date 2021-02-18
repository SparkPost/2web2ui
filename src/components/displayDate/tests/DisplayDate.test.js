import React from 'react';
import { shallow } from 'enzyme';
import DisplayDate from '../DisplayDate';

describe('DisplayDate Component', () => {
  Date.now = () => new Date('2017-11-17T18:08:00.000+00:00');

  it('should render time ago ', () => {
    const props = {
      timestamp: '2017-11-17T15:08:00.000+00:00',
      formattedDate: 'YYYY/MM/DD HH:mm',
    };
    const wrapper = shallow(<DisplayDate {...props} />);
    expect(wrapper.find('TimeAgo').prop('date')).toEqual(props.timestamp);
  });

  it('should render formattedDate', () => {
    const props = {
      timestamp: '2017-11-16T18:08:00.000+00:00',
      formattedDate: 'YYYY/MM/DD HH:mm',
    };
    const wrapper = shallow(<DisplayDate {...props} />);
    expect(wrapper.text()).toEqual('YYYY/MM/DD HH:mm');
  });

  it('should render formattedDate when external condition provided', () => {
    const props = {
      timestamp: '2017-11-17T15:08:00.000+00:00',
      formattedDate: 'YYYY/MM/DD HH:mm',
      diffScale: 'minutes',
      diffTime: '59',
    };
    const wrapper = shallow(<DisplayDate {...props} />);
    expect(wrapper.text()).toEqual('YYYY/MM/DD HH:mm');
  });
});
