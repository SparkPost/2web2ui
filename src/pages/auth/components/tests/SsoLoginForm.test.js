import React from 'react';
import { shallow } from 'enzyme';

import { SsoLoginForm } from '../SsoLoginForm';

describe('Component: SsoLoginForm', () => {
  function subject(props) {
    return shallow(<SsoLoginForm {...props} />);
  }

  it('should render', () => {
    expect(subject()).toMatchSnapshot();
  });

  it('should render during login', () => {
    expect(subject({ loginPending: true })).toMatchSnapshot();
  });

  it('calls onSubmit', () => {
    const handleSubmit = jest.fn();
    subject({ handleSubmit })
      .find('Form')
      .first()
      .simulate('submit');
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders errors', () => {
    expect(subject({ loginError: 'asplode' })).toMatchSnapshot();
  });
});
