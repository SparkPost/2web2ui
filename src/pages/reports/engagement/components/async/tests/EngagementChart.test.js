import React from 'react';
import { shallow } from 'enzyme';
import cases from 'jest-in-case';
import { useHibana } from 'src/context/HibanaContext';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import EngagementChart from '../EngagementChart';
import styles from '../EngagementChart.module.scss';

jest.mock('src/hooks/useHibanaOverride');
jest.mock('src/context/HibanaContext');

useHibana.mockImplementation(() => [{ isHibanaEnabled: false }]);
useHibanaOverride.mockReturnValue(styles);

cases(
  'EngagementChart',
  props => {
    const wrapper = shallow(<EngagementChart {...props} />);
    expect(wrapper).toMatchSnapshot();
  },
  {
    'renders loading': { loading: true },
    'renders empty panel': { loading: false },
    'renders engagement chart': {
      accepted: 40000,
      clicks: 2525,
      loading: false,
      opens: 5000,
      sent: 50000,
    },
  },
);
