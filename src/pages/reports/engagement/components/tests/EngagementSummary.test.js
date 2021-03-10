import React from 'react';
import { shallow } from 'enzyme';
import cases from 'jest-in-case';
import moment from 'moment';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import { EngagementSummary } from '../EngagementSummary';
import styles from '../EngagementSummary.module.scss';

jest.mock('src/hooks/useHibanaOverride');

useHibanaOverride.mockReturnValue(styles);

cases(
  'EngagementSummary',
  props => {
    const wrapper = shallow(<EngagementSummary {...props} />);
    expect(wrapper).toMatchSnapshot();
  },
  {
    'renders loading panel': { loading: true },
    'renders loading panel when filters are not ready': { loading: false, filters: {} },
    'returns null': { loading: false, filters: { relativeRange: 'hour' } },
    'renders metric summary': {
      clicks: 123,
      filters: { relativeRange: 'hour' },
      loading: false,
      opens: 523,
      sent: 123123,
      accepted: 123100,
    },
    'renders metric summary with custom time range': {
      clicks: 123,
      filters: {
        from: moment('2018-01-31T20:00:00'),
        relativeRange: 'custom',
        to: moment('2018-02-01T20:00:00'),
      },
      loading: false,
      opens: 523,
      sent: 123123,
      accepted: 123100,
    },
  },
);
