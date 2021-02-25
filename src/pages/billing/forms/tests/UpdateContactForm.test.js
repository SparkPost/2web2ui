import React from 'react';
import { UpdateContactForm } from '../UpdateContactForm';
import { shallow } from 'enzyme';

describe('Form Container: Update Contact', () => {
  let wrapper;

  const props = {
    billing: { countries: []},
    handleSubmit: jest.fn(),
    showAlert: jest.fn(),
    getBillingCountries: jest.fn(),
    updateBillingContact: jest.fn(() => Promise.resolve()),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    wrapper = shallow(<UpdateContactForm {...props} />);
  });

  it('should render', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should get countries on mount', () => {
    const countriesSpy = jest.spyOn(wrapper.instance().props, 'getBillingCountries');
    wrapper.instance().componentDidMount();
    expect(countriesSpy).toHaveBeenCalled();
  });

  it('should submit redux-Form', () => {
    const submitSpy = jest.spyOn(wrapper.instance().props, 'handleSubmit');
    wrapper.find('Form').simulate('submit');
    expect(submitSpy).toHaveBeenCalled();
  });

  it('should update contact', () => {
    const updateSpy = jest.spyOn(wrapper.instance().props, 'updateBillingContact');
    wrapper.instance().onSubmit('hello');
    expect(updateSpy).toHaveBeenCalledWith('hello');
  });
});
