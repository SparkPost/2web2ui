import React from 'react';
import { shallow } from 'enzyme';
import { Modal } from 'src/components/matchbox';
import { ShareModal } from '../ShareModal';
import * as dateHelpersMock from 'src/helpers/date';
import { WindowEvent } from 'src/components/matchbox';

jest.mock('src/helpers/date');

describe('Component: ShareModal', () => {
  let wrapper;
  let testProps;

  beforeEach(() => {
    dateHelpersMock.relativeDateOptions = [{ value: 'valid', label: 'Valid Labels Ago' }];
    testProps = {
      handleToggle: jest.fn(),
      searchOptions: {
        range: 'valid',
        recipients: ['one@test.com', 'two+2@test.com'],
      },
      location: {
        pathname: '/route',
      },
      history: {
        replace: jest.fn(),
      },
    };
    wrapper = shallow(<ShareModal {...testProps} />);
  });

  it('should render correctly when not open', () => {
    expect(wrapper.find(Modal.LEGACY).props().open).toBe(false);
    expect(testProps.history.replace).toHaveBeenCalledWith({
      pathname: '/route',
      search: 'range=valid&recipients=one%40test.com&recipients=two%2B2%40test.com',
    });
  });

  it('updates the link if options are changed', () => {
    testProps.history.replace.mockReset();
    wrapper.setProps({ searchOptions: { range: '7days' } });
    expect(testProps.history.replace).toHaveBeenCalledTimes(1);
  });

  it('should render correctly when open', () => {
    wrapper.setState({ open: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with a valid relative range', () => {
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.state('pinned')).toEqual(true);
  });

  it('should unpin when clicking the checkbox', () => {
    expect(wrapper.state('pinned')).toEqual(true);
    expect(wrapper.find('CopyField').props().value).toMatchSnapshot();
    wrapper.find('#pin-relative-link').simulate('change');
    expect(wrapper.state('pinned')).toEqual(false);
    expect(wrapper.find('CopyField').props().value).toMatchSnapshot();
  });

  it('should handle keydown events correctly', () => {
    wrapper.setState({ open: true }); //open modal first

    const keydown = wrapper.find(WindowEvent).props().handler;

    wrapper.setState({ open: true });
    keydown({ key: 'Enter' });
    expect(wrapper.state().open).toBe(false);

    wrapper.setState({ open: true });
    keydown({ key: 'Space' }); //shouldn't do anything
    expect(wrapper.state().open).toBe(true);
  });
});
