import { shallow } from 'enzyme';
import React from 'react';
import cases from 'jest-in-case';
import every from 'lodash/every';
import SettingsForm from '../SettingsForm';

describe('SettingsForm', () => {
  const subject = props => {
    const defaultProps = {
      domains: [{ domain: 'test.com' }, { domain: 'verified.com' }],
      draft: {
        id: 'fake-id',
      },
      domainsLoading: false,
      hasSubaccounts: false,
      canViewSubaccount: false,
      content: {
        html: '<p>Hello</p>',
        text: '',
      },
      values: {
        content: {},
        name: 'Test Template',
      },
      isPublishedMode: false,
      handleSubmit: jest.fn(func => func),
      showAlert: jest.fn(),
      setHasSaved: jest.fn(),
      isReadOnly: false,
    };

    return shallow(<SettingsForm {...defaultProps} {...props} />);
  };

  it('renders without subaccounts', () => {
    const wrapper = subject();

    expect(wrapper.exists('SubaccountSection')).toBe(false);
  });

  it('renders with subaccounts', () => {
    expect(
      subject({ hasSubaccounts: true, canViewSubaccount: true }).exists('SubaccountSection'),
    ).toBe(true);
  });

  it('renders From Email help text with no verified domains', () => {
    const wrapper = subject({ domains: [] });
    expect(wrapper.find('[name="content.from.email"]').prop('helpText')).toEqual(
      'You do not have any verified sending domains to use.',
    );
  });

  it('renders From Email help text with no verified domains for subaccount', () => {
    const wrapper = subject({ subaccountId: 101, domains: [] });
    expect(wrapper.find('[name="content.from.email"]').prop('helpText')).toEqual(
      'The selected subaccount does not have any verified sending domains.',
    );
  });

  it('renders id field disabled and leverages the CopyField component', () => {
    const wrapper = subject();

    expect(wrapper.find('[name="id"]').prop('disabled')).toBe(true);
    expect(wrapper.find('CopyField')).toEqual(wrapper.find('[name="id"]'));
  });

  describe('Published version', () => {
    it('renders with fields disabled', () => {
      const wrapper = subject({
        hasSubaccounts: true,
        canViewSubaccount: true,
        isReadOnly: true,
      });
      const fieldProps = wrapper.find('Field').map(field => field.prop('disabled'));
      expect(fieldProps.length).toEqual(9);
      expect(every(fieldProps)).toBe(true);
      expect(wrapper.find('SubaccountSection').prop('disabled')).toBe(true);
      expect(wrapper.find('[name="id"]')).toHaveProp('disabled', true);
    });

    it('renders settings intro when draft does not exist', () => {
      expect(
        subject({ hasDraft: false, isPublishedMode: true }).find('[className="SettingsIntro"]'),
      ).toMatchSnapshot();
    });

    it('renders settings intro when draft exists', () => {
      expect(
        subject({ hasDraft: true, isPublishedMode: true }).find('[className="SettingsIntro"]'),
      ).toMatchSnapshot();
    });
  });

  cases(
    'disables submit button',
    ({ name, ...props }) => {
      const wrapper = subject({ valid: true, ...props });
      expect(wrapper.find('Button[type="submit"]')).toHaveProp('disabled', true);
    },
    {
      'when submitting': {
        submitting: true,
      },
      'when pristine': {
        pristine: true,
      },
      'when invalid': {
        valid: false,
      },
      'when in publish mode': {
        isReadOnly: true,
      },
    },
  );

  describe('when Form is submitted', () => {
    const submitForm = async (props = {}, values = {}) => {
      const wrapper = subject({
        parsedTestData: {
          name: 'Bob Bell',
        },
        pristine: false,
        setHasSaved: () => {},
        showAlert: () => {},
        updateDraft: () => Promise.resolve(),
        valid: true,
        ...props,
      });

      await wrapper.find('Form').simulate('submit', {
        description: '',
        options: { click_tracking: true, open_tracking: true, transactional: true },
        ...values,
        content: { text: '', ...values.content },
      });

      return wrapper;
    };

    it('requests setting update', async () => {
      const draft = { id: 'test-template' };
      const content = { html: 'Hello {{name}}', text: 'Hello {{name}}' };
      const values = {
        name: 'Test Template',
        description: 'This is only a test',
        shared_with_subaccounts: true,
        content: {
          from: { email: 'bob@bell.com' },
        },
      };
      const updateDraft = jest.fn(() => Promise.resolve());
      await submitForm({ content, draft, updateDraft }, values);

      expect(updateDraft).toHaveBeenCalledWith(
        {
          id: 'test-template',
          name: 'Test Template',
          description: 'This is only a test',
          content: {
            amp_html: undefined,
            html: 'Hello {{name}}',
            text: 'Hello {{name}}',
            from: { email: 'bob@bell.com' },
          },
          options: { click_tracking: true, open_tracking: true, transactional: true },
          shared_with_subaccounts: true,
          parsedTestData: {
            name: 'Bob Bell',
          },
        },
        undefined,
      );
    });

    it('requests setting update for template assinged to subaccount', async () => {
      const draft = {
        id: 'test-template-for-123',
        subaccount_id: 123,
      };
      const updateDraft = jest.fn(() => Promise.resolve());
      await submitForm({ draft, updateDraft });

      expect(updateDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-template-for-123',
          shared_with_subaccounts: undefined,
        }),
        123,
      );
    });

    it('reports have has completed', async () => {
      const setHasSaved = jest.fn();
      await submitForm({ setHasSaved });

      expect(setHasSaved).toHaveBeenCalledWith(true);
    });

    it('alerts on success', async () => {
      const showAlert = jest.fn();
      await submitForm({ showAlert });

      expect(showAlert).toHaveBeenCalledWith({
        type: 'success',
        message: 'Template settings updated.',
      });
    });
  });
});
