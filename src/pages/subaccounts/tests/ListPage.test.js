import React from 'react';
import { shallow } from 'enzyme';
import { ListPage } from '../ListPage';

const props = {
  loading: false,
  error: null,
  listSubaccounts: jest.fn(),
  subaccounts: [
    {
      id: 123,
      name: 'Joe\'s Garage',
      status: 'active',
      ip_pool: 'my_ip_pool',
      compliance_status: 'active'
    },
    {
      id: 456,
      name: 'SharkPost',
      status: 'active',
      compliance_status: 'active'
    },
    {
      id: 789,
      name: 'Dev Avocado',
      status: 'suspended',
      compliance_status: 'active'
    }
  ]
};

let wrapper;

beforeEach(() => {
  wrapper = shallow(<ListPage {...props} />);
});

it('renders correctly', () => {
  expect(wrapper).toMatchSnapshot();
  expect(props.listSubaccounts).toHaveBeenCalled();
});

it('renders empty state', () => {
  wrapper = shallow(<ListPage {...props} loading={false} error={null} subaccounts={[]} />);
  expect(wrapper).toMatchSnapshot();
});

it('renders errors when present', () => {
  wrapper.setProps({ error: { message: 'Uh oh! It broke.' }});
  expect(wrapper).toMatchSnapshot();
});

describe('onReloadApiBanner', () => {
  it('calls listSubaccounts again', () => {
    wrapper.instance().onReloadApiBanner();
    expect(props.listSubaccounts).toHaveBeenCalledTimes(2);
  });
});
