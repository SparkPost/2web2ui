import React from 'react';
import { DataTable } from '../DataTable';
import { shallow } from 'enzyme';

jest.mock('src/helpers/reports');

describe('Rejection Data Table: ', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      list: [
        {
          count_rejected: 65,
          rejection_category_name: 'Policy Rejection',
          rejection_category_id: 1,
          reason: '551 - Cannot Relay 105',
          domain: 'gmail.com'
        },
        {
          count_rejected: 62,
          rejection_category_name: 'Policy Rejection',
          rejection_category_id: 1,
          reason: '550 - Invalid recipient ...@... (#5.1.1)',
          domain: 'gmail.com'
        }
      ],
      addFilters: jest.fn()
    };
    wrapper = shallow(<DataTable {...props} />);
  });

  afterEach(() => { jest.resetAllMocks(); });

  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with no rejections', () => {
    wrapper.setProps({ list: []});
    expect(wrapper).toMatchSnapshot();
  });

  it('getRowData should render row data properly', () => {
    const rows = wrapper.instance().getRowData({ reason: 'bad delay', rejection_category_name: 'cat1', count_rejected: 10, domain: 'gmail.com' });
    expect(rows).toMatchSnapshot();
  });

});
