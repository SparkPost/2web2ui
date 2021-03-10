import React from 'react';
import { shallow } from 'enzyme';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import MetricCard from '../MetricCard';
import styles from '../MetricCard.module.scss';

jest.mock('src/hooks/useHibanaOverride');

const props = {
  label: 'Card Label',
  value: 'Card Value',
  tooltipContent: 'Tooltip Content',
  primary: true,
};

describe('MetricCard Component: ', () => {
  beforeEach(() => {
    useHibanaOverride.mockReturnValue(styles);
  });

  it('should render correctly with all props', () => {
    const wrapper = shallow(<MetricCard {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render without tooltip', () => {
    const wrapper = shallow(<MetricCard {...props} />);
    wrapper.setProps({ tooltipContent: null });
    expect(wrapper).toMatchSnapshot();
  });
});
