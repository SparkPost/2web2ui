import { shallow } from 'enzyme';
import React from 'react';
import cases from 'jest-in-case';

import StatusDescription from '../StatusDescription';

import { verificationCases } from '../../tests/helpers/domain';

describe('StatusDescription component', () => {
  let props;
  let wrapper;

  describe('Shallow tests', () => {
    beforeEach(() => {
      props = {
        status: 'unverified',
        readyFor: {
          sending: false,
          bounce: false,
          dkim: false,
        },
        domain: {
          shared_with_subaccounts: false,
          is_default_bounce_domain: false,
        },
      };
      wrapper = shallow(<StatusDescription {...props} />);
    });

    cases(
      'renders verification status correctly',
      ({ status }) => {
        wrapper.setProps({ status });
        expect(wrapper).toMatchSnapshot();
      },
      verificationCases,
    );

    it('does not render subaccount details on primary account domains', () => {
      expect(wrapper).toMatchSnapshot();
    });

    it('renders subaccount details', () => {
      wrapper.setProps({ domain: { ...props.domain, subaccount_id: 101 } });
      expect(wrapper).toMatchSnapshot();
    });
  });
});
