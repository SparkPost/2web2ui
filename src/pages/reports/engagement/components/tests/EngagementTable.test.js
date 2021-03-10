import React from 'react';
import { shallow } from 'enzyme';
import cases from 'jest-in-case';

import EngagementTable from '../EngagementTable';

cases('EngagementTable', (props) => {
  const wrapper = shallow(<EngagementTable {...props} />);
  expect(wrapper).toMatchSnapshot();
}, {
  'when loading': { loading: true },
  'when no results': { data: [], loading: false },
  'when renders table': {
    data: [
      { count_raw_clicked_approx: 1, count_clicked: 10, link_name: 'Raw URL' },
      { count_raw_clicked_approx: 2, count_clicked: 20, link_name: 'Nintendo' }
    ],
    loading: false
  }
});
