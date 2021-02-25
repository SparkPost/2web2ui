import React from 'react';
import { shallow } from 'enzyme';

import CreatePage from '../CreatePage';

describe('CreatePage', () => {
  const subject = (props = {}) =>
    shallow(
      <CreatePage
        loading={false}
        submitting={false}
        pristine={true}
        handleSubmit={handler => handler}
        listDomains={jest.fn()}
        history={{ push: jest.fn() }}
        showAlert={jest.fn()}
        createTemplate={jest.fn(() => Promise.resolve())}
        {...props}
      />,
    );

  it('renders correctly on loading', () => {
    expect(subject({ loading: true }).find('Loading')).toExist();
  });

  it('loads domains on load', () => {
    const mockListDomains = jest.fn();
    subject({ listDomains: mockListDomains });
    expect(mockListDomains).toHaveBeenCalledTimes(1);
  });

  describe('Submit button', () => {
    it('renders disable states correctly', () => {
      expect(
        subject({ submitting: true, pristine: false, valid: true })
          .find('Button')
          .prop('disabled'),
      ).toBe(true);
      expect(
        subject({ submitting: false, pristine: true, valid: true })
          .find('Button')
          .prop('disabled'),
      ).toBe(true);
      expect(
        subject({ submitting: false, pristine: false, valid: false })
          .find('Button')
          .prop('disabled'),
      ).toBe(true);
    });

    it('renders enabled states correctly', () => {
      expect(
        subject({ submitting: false, pristine: false, valid: true })
          .find('Button')
          .prop('disabled'),
      ).toBe(false);
    });
  });

  describe('handleCreate', () => {
    it('calls "create" with Form data when submitting', () => {
      const promise = Promise.resolve();
      const mockCreate = jest.fn(() => promise);
      const formData = {
        name: 'Foo',
        id: 'foo',
        content: {},
        assignTo: 'shared',
      };
      const wrapper = subject({
        createTemplate: mockCreate,
        history: { push: jest.fn() },
      });
      wrapper.find('Form').simulate('submit', formData);

      return promise.then(() => {
        expect(mockCreate).toHaveBeenCalledWith({
          ...formData,
          content: {
            ...formData.content,
            text: '',
          },
          parsedTestData: {
            substitution_data: {},
            metadata: {},
            options: {},
          },
          sharedWithSubaccounts: true,
        });
      });
    });

    it('does now call create with "sharedWithSubaccounts" when the template is not assign to "shared"', () => {
      const promise = Promise.resolve();
      const mockCreate = jest.fn(() => promise);
      const formData = {
        name: 'Foo',
        id: 'foo',
        content: {},
        assignTo: 'not "shared"',
      };
      const wrapper = subject({
        createTemplate: mockCreate,
        history: { push: jest.fn() },
      });

      wrapper.find('Form').simulate('submit', formData);

      return promise.then(() => {
        expect(mockCreate).toHaveBeenCalledWith({
          ...formData,
          content: {
            ...formData.content,
            text: '',
          },
          parsedTestData: {
            substitution_data: {},
            metadata: {},
            options: {},
          },
          sharedWithSubaccounts: false,
        });
      });
    });

    it('alerts & redirects to edit page', async () => {
      const mockPush = jest.fn();
      const mockAlert = jest.fn();
      const createPromise = Promise.resolve();
      const wrapper = subject({
        createTemplate: jest.fn(() => createPromise),
        history: { push: mockPush },
        showAlert: mockAlert,
      });

      wrapper.find('Form').simulate('submit', { id: 'foo', content: {} });

      return createPromise.then(() => {
        expect(mockPush).toHaveBeenCalledWith('/templates/edit/foo/draft/content');
        expect(mockAlert).toHaveBeenCalledWith({ type: 'success', message: 'Template Created.' });
      });
    });
  });
});
