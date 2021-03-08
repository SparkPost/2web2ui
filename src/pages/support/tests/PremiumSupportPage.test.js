import React from 'react';
import { shallow } from 'enzyme';
import { PremiumSupportPage } from '../PremiumSupportPage';

jest.mock('../helpers/formHelpers');

const props = {
  loading: false,
  keys: ['an array of keys'],
  handleSubmit: jest.fn(a => a),
  createTicket: jest.fn(),
  submitting: false,
  history: { push: jest.fn() },
  showAlert: jest.fn(),
};

let wrapper;

describe('PremiumSupportPage', () => {
  beforeEach(() => {
    wrapper = shallow(<PremiumSupportPage {...props} />);
  });

  it('default state', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('renders submitting state correctly', () => {
    wrapper.setProps({ submitting: true });
    expect(wrapper.find('Button')).toMatchSnapshot();
  });

  it('submits Form correctly', () => {
    wrapper.find('Form').simulate('submit');
    expect(props.handleSubmit).toHaveBeenCalledTimes(1);
    expect(props.createTicket.mock.calls[0]).toMatchSnapshot();
  });

  it('handles submit success', () => {
    wrapper.setProps({ submitSucceeded: true, ticketId: '123' });
    expect(props.history.push).toHaveBeenCalledWith('/account/billing');
    expect(props.showAlert.mock.calls[0]).toMatchSnapshot();
  });

  it('handles submit error case', () => {
    wrapper.setProps({ submitSucceeded: true, createError: 'error message' });
    expect(props.history.push).not.toHaveBeenCalled();
    expect(props.showAlert).not.toHaveBeenCalled();
  });
});
