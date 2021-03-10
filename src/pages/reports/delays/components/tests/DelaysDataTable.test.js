import React from 'react';
import { DelaysDataTable } from '../DelaysDataTable';
import { shallow } from 'enzyme';

describe('DelaysDataTable: ', () => {
  let wrapper;

  const props = {
    rows: [
      {
        count_delayed: 100,
        count_delayed_first: 1,
        reason: 'my reason'
      }
    ],
    totalAccepted: 50,
    addFilters: jest.fn()
  };

  beforeEach(() => {
    wrapper = shallow(<DelaysDataTable {...props} />);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });


  it('should render page', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should show empty message when there are no reasons', () => {
    wrapper.setProps({ rows: null });
    expect(wrapper).toMatchSnapshot();
    wrapper.setProps({ rows: []});
    expect(wrapper).toMatchSnapshot();
  });

  it('should render row data properly', () => {
    const rows = wrapper.instance().getRowData({ reason: 'bad delay', count_delayed: 1, count_delayed_first: 10, domain: 'gmail.com' });
    expect(rows).toMatchSnapshot();
  });

});
