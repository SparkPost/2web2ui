import React from 'react';
import { ButtonLink } from 'src/components/links';
import Alert from '../Alert';
import { shallow } from 'enzyme';

describe('Alert', () => {
  window.setTimeout = jest.fn(a => a);
  window.clearTimeout = jest.fn(a => a);

  const props = {
    autoDismiss: true,
    timeoutInterval: 500,
    message: 'message',
    type: 'error',
    details: 'details',
    onDismiss: jest.fn(),
  };

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Alert {...props} />);
  });

  it('should handle action on click', () => {
    wrapper.setProps({
      details: null,
      action: { content: 'action content', onClick: jest.fn() },
    });
    wrapper.find(ButtonLink).simulate('click');
    expect(wrapper.instance().props.action.onClick).toHaveBeenCalled();
  });

  it('should handle details click', () => {
    wrapper.find(ButtonLink).simulate('click');
    expect(wrapper).toHaveState('showDetails', true);
    expect(wrapper.instance().timeout).not.toBe(null);

    // refresh
    expect(window.clearTimeout).toHaveBeenCalledWith(wrapper.instance().timeout);
    expect(window.setTimeout).toHaveBeenCalledWith(
      wrapper.instance().handleDismiss,
      props.timeoutInterval,
    );
  });

  it('should handle dismiss', () => {
    wrapper.find('Snackbar').simulate('dismiss');
    expect(props.onDismiss).toHaveBeenCalled();
  });
});
