import { shallow } from 'enzyme';
import React from 'react';
import { SSOPage } from '../SSOPage';
import { DEFAULT_REDIRECT_ROUTE } from 'src/constants';

describe('SSOPage', () => {

  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      login: jest.fn(),
      location: {
        search: '?ad=eyJhY2Nlc3NUb2tlbiI6MTIzLCJ1c2VybmFtZSI6InNhbWxfdGVzdCJ9' //{accessToken: 123, username: "saml_test"}
      },
      history: {
        push: jest.fn()
      }
    };
  });

  it('renders correctly', () => {
    wrapper = shallow(<SSOPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });


  it('calls login with correct data (saml)', () => {
    wrapper = shallow(<SSOPage {...props} />);
    expect(props.login).toHaveBeenCalledTimes(1);
    expect(props.login).toHaveBeenCalledWith({ authData: { access_token: 123, username: 'saml_test', refresh_token: '' }, saveCookie: true });
  });

  it('calls login with correct data (azure)', () => {
    props.location.search = '?token=eyJhY2Nlc3NUb2tlbiI6MTIzLCJ1c2VybmFtZSI6ImF6dXJlX3Rlc3QifQ=='; //{accessToken: 123, username: "azure_test"}
    wrapper = shallow(<SSOPage {...props} />);
    expect(props.login).toHaveBeenCalledTimes(1);
    expect(props.login).toHaveBeenCalledWith({ authData: { access_token: 123, username: 'azure_test', refresh_token: '' }, saveCookie: true });
  });

  it('redirects correctly after login', () => {
    wrapper = shallow(<SSOPage {...props} />);
    expect(props.history.push).toHaveBeenCalledWith(DEFAULT_REDIRECT_ROUTE);
  });

  it('redirects to auth after login fail (unknown payload)', () => {
    props.location.search = 'eyJmb28iOiJiYXIifQ=='; //btoa(JSON.stringify({foo: 'bar'}))
    wrapper = shallow(<SSOPage {...props} />);
    expect(props.history.push).toHaveBeenCalledWith('/auth');
  });

  it('redirects to auth after login fail (invalid data: error parsing)', () => {
    props.location.search = null;
    wrapper = shallow(<SSOPage {...props} />);
    expect(props.history.push).toHaveBeenCalledWith('/auth');
  });

});
