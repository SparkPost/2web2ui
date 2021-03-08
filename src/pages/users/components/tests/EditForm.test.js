import React from 'react';
import { shallow } from 'enzyme';

import EditForm from '../EditForm';

describe('Component: EditForm', () => {
  const baseProps = {
    isAccountSingleSignOnEnabled: true,
    currentUser: { name: 'current-user' },
    user: { access: 'admin', email: 'test-user@test.com', name: 'test-user' },
  };

  function subject(props) {
    return shallow(<EditForm {...baseProps} {...props} />);
  }

  it('should render', () => {
    expect(subject()).toMatchSnapshot();
  });

  it('should hide single sign-on checkbox if single sign-on is not configured', () => {
    const wrapper = subject({ isAccountSingleSignOnEnabled: false });
    expect(wrapper.find('Field[name="is_sso"]')).not.toExist();
  });

  it('should show single sign-on checkbox if single sign-on is enabled', () => {
    const wrapper = subject();
    expect(wrapper.find('Field[name="is_sso"]')).toExist();
  });

  it('should show role selector if not a subaccount_reporting user', () => {
    const wrapper = subject();
    expect(wrapper.find('Field[name="access"]')).toExist();
    expect(wrapper.find('LabelledValue[name="subaccountInfo"]')).not.toExist();
  });

  it('should show subaccount info instead of the role selector for subaccount_reporting users', () => {
    const wrapper = subject({
      user: { ...baseProps.user, access: 'subaccount_reporting' },
      subaccount: { id: 23, name: 'aSubaccount' },
    });
    expect(wrapper.find('LabelledValue[name="subaccountInfo"]')).toExist();
    expect(wrapper.find('Field[name="access"]')).not.toExist();
  });

  it('should call submit handler', () => {
    const onSubmit = jest.fn();
    subject({ onSubmit })
      .find('Form')
      .first()
      .simulate('submit');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
