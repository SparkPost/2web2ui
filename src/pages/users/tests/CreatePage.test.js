import React from 'react';
import { shallow } from 'enzyme';
import cases from 'jest-in-case';
import { CreatePage } from '../CreatePage';
import { ROLES } from 'src/constants';
import * as segmentHelpers from 'src/helpers/segment';
segmentHelpers.segmentTrack = jest.fn();
describe('Page: User Create Page', () => {
  let baseProps;
  let values;

  beforeEach(() => {
    baseProps = {
      submitting: false,
      pristine: false,
      handleSubmit: jest.fn(fn => fn),
      inviteUser: jest.fn(() => Promise.resolve()),
      showAlert: jest.fn(),
      history: {
        push: jest.fn(),
      },
      isSubaccountReportingLive: false,
    };
    values = { email: 'email', access: 'access', useSubaccount: false, subaccount: undefined };
  });

  const subject = props => shallow(<CreatePage {...baseProps} {...props} />);

  const submit = (wrapper, values) => wrapper.find('Form').prop('onSubmit')(values);

  it('should render correctly by default', () => {
    expect(subject()).toMatchSnapshot();
  });

  it('should update submit button when submitting', () => {
    expect(subject({ submitting: true }).find('Button')).toMatchSnapshot();
  });

  it('should disable submit when pristine', () => {
    expect(subject({ pristine: true }).find('Button')).toMatchSnapshot();
  });

  cases(
    'should use feature flag to control subaccount assignment',
    ({ isSubaccountReportingLive }) => {
      expect(
        subject({ isSubaccountReportingLive })
          .find('Field[name="access"]')
          .prop('allowSubaccountAssignment'),
      ).toBe(isSubaccountReportingLive);
    },
    {
      enabled: { isSubaccountReportingLive: true },
      disabled: { isSubaccountReportingLive: false },
    },
  );

  it('should invite a user on submit', async () => {
    const wrapper = subject();
    await submit(wrapper, values);

    expect(baseProps.inviteUser).toHaveBeenCalledWith(
      values.email,
      values.access,
      values.subaccount,
    );
    expect(baseProps.showAlert).toHaveBeenCalledWith({
      type: 'success',
      message: `Invitation sent to ${values.email}`,
    });
    expect(baseProps.history.push).toHaveBeenCalledWith('/account/users');
  });

  it('should invite a subaccount user on submit', async () => {
    const subaccountValues = {
      email: values.email,
      access: ROLES.REPORTING,
      useSubaccount: true,
      subaccount: 101,
    };
    const wrapper = subject();
    await submit(wrapper, subaccountValues);
    expect(baseProps.inviteUser).toHaveBeenCalledWith(
      subaccountValues.email,
      ROLES.SUBACCOUNT_REPORTING,
      subaccountValues.subaccount,
    );
    expect(baseProps.history.push).toHaveBeenCalledWith('/account/users');
    expect(segmentHelpers.segmentTrack).toHaveBeenCalledWith(
      segmentHelpers.SEGMENT_EVENTS.INVITE_SENT,
      { invitee_email: 'email', invitee_role: 'subaccount_reporting' },
    );
  });
});
