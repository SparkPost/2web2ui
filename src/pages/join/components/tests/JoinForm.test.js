import { shallow } from 'enzyme';
import React from 'react';
import { JoinForm } from '../JoinForm';

let props;
let instance;
let wrapper;

describe('JoinForm', () => {
  let mockRecaptcha;

  beforeEach(() => {
    mockRecaptcha = {
      execute: jest.fn(),
      reset: jest.fn(),
    };

    props = {
      loading: false,
      onSubmit: jest.fn(),
      handleSubmit: jest.fn(),
    };

    wrapper = shallow(<JoinForm {...props} />);
    instance = wrapper.instance();
    wrapper.setState({ reCaptchaInstance: mockRecaptcha });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('render', () => {
    it('disables form when loading', () => {
      wrapper.setProps({ loading: true });
      expect(wrapper).toMatchSnapshot();
    });

    it('disables form when recaptcha is not loaded', () => {
      wrapper.setState({ reCaptchaReady: false });
      expect(wrapper).toMatchSnapshot();
    });

    it('enables form correctly', () => {
      wrapper.setProps({ loading: false, pristine: false, invalid: false });
      wrapper.setState({ reCaptchaReady: true });
      expect(wrapper).toMatchSnapshot();
    });

    describe('submit', () => {
      it('invokes recaptcha challenge on click', () => {
        const form = wrapper.find('Form').first();
        form.simulate('submit', { preventDefault: jest.fn() });
        expect(mockRecaptcha.execute).toHaveBeenCalledTimes(1);
      });
    });

    describe('executeRecaptcha', () => {
      it('invokes recaptcha on click of submit button', () => {
        wrapper.setState({ reCaptchaInstance: mockRecaptcha });
        instance.executeRecaptcha({ preventDefault: jest.fn() });
        expect(mockRecaptcha.execute).toHaveBeenCalledTimes(1);
      });
    });

    describe('reCaptchaLoaded', () => {
      it('sets reCaptchaReady to be true', () => {
        instance.reCaptchaLoaded();
        expect(wrapper.state().reCaptchaReady).toBe(true);
      });
    });

    describe('linkRecaptcha', () => {
      it('sets reCaptchaInstance to state if not set', () => {
        instance.setState({ reCaptchaInstance: null });
        instance.linkRecaptcha({});
        expect(wrapper.state().reCaptchaInstance).toEqual({});
      });

      it('does not set reCaptchaInstance to state if already set', () => {
        instance.linkRecaptcha({});
        expect(wrapper.state().reCaptchaInstance).toEqual(mockRecaptcha);
      });
    });

    describe('recaptchaVerifyCallback', () => {
      it('resets recaptcha', () => {
        instance.recaptchaVerifyCallback('foobar');
        expect(mockRecaptcha.reset).toHaveBeenCalledTimes(1);
      });

      it('sets recaptcha response to state & invokes handleSubmit', () => {
        const formValues = {
          first_name: 'foo',
          last_name: 'bar',
          email: 'foo@bar.com',
          password: '***',
        };
        wrapper.setProps({ formValues });
        instance.recaptchaVerifyCallback('foobar');
        expect(wrapper.state().recaptcha_response).toEqual('foobar');
        expect(props.handleSubmit).toHaveBeenCalledWith(instance.onSubmit);
      });
    });

    describe('onSubmit', () => {
      beforeEach(() => {
        wrapper.setState({ recaptcha_response: 'some-response' });
      });

      it('submits with correct data', () => {
        const formValues = {
          first_name: 'foo',
          last_name: 'bar',
          email: 'foo@bar.com',
          password: '***',
        };
        instance.onSubmit(formValues);
        expect(props.onSubmit).toHaveBeenCalledWith({
          ...formValues,
          recaptcha_response: 'some-response',
          recaptcha_type: 'invisible',
        });
      });
    });
  });
});
