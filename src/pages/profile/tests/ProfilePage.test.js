import { shallow } from 'enzyme';
import React from 'react';
import cases from 'jest-in-case';

import { ProfilePage } from '../ProfilePage';
import { AccessControl } from 'src/components/auth';
import errorTracker from 'src/helpers/errorTracker';

jest.mock('src/helpers/errorTracker');

let props;
let wrapper;
let instance;

beforeEach(() => {
  props = {
    currentUser: {
      username: 'Lord Stark',
      email: 'ned.stark@winterfell.biz',
      customer: 12345,
      access_level: 'user'
    },
    updateUser: jest.fn(() => Promise.resolve()),
    getCurrentUser: jest.fn(() => Promise.resolve()),
    confirmPassword: jest.fn(() => Promise.resolve()),
    showAlert: jest.fn()
  };

  wrapper = shallow(<ProfilePage {...props} />);
  instance = wrapper.instance();
});

describe('ProfilePage', () => {
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  cases('handles the various account types', ({ access_level, result }) => {
    const condition = wrapper.find(AccessControl).first().prop('condition');
    expect(condition({ currentUser: { access_level }, ready: true })).toEqual(result);
  }, {
    'user': { access_level: 'user', result: true },
    'heroku': { access_level: 'heroku', result: false },
    'azure': { access_level: 'azure', result: false }
  });

  describe('updateProfile', () => {
    it('should update profile correctly', async() => {
      await instance.updateProfile({ firstName: 'John', lastName: 'Doe' });
      expect(props.updateUser).toHaveBeenCalledWith('Lord Stark', { first_name: 'John', last_name: 'Doe' });
      expect(props.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(props.showAlert).toHaveBeenCalledTimes(0);
    });

    it('should ignore refetch error, but report error silently', async() => {
      const getCurrentUserError = new Error('wow');
      props.getCurrentUser.mockReturnValue(Promise.reject(getCurrentUserError));
      await instance.updateProfile({ firstName: 'Ryan', lastName: 'Seacrest' });

      expect(props.updateUser).toHaveBeenCalledWith('Lord Stark', { first_name: 'Ryan', last_name: 'Seacrest' });
      expect(props.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(props.showAlert).not.toHaveBeenCalled();
      expect(errorTracker.report).toHaveBeenCalledWith('silent-ignore-refetch-current-user', getCurrentUserError);
    });
  });

  describe('updatePassword', () => {
    it('updates password correctly', async() => {
      await instance.updatePassword({ currentPassword: '111', newPassword: '222' });
      expect(props.confirmPassword).toHaveBeenCalledWith('Lord Stark', '111');
      expect(props.updateUser).toHaveBeenCalledWith('Lord Stark', { password: '222' });
      expect(props.showAlert).toHaveBeenCalledTimes(0);
    });
  });
});
