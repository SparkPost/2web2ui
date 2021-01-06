import React from 'react';
import { shallow } from 'enzyme';

import ListPage from '../ListPage';

describe('ListPage', () => {
  const subject = (props = {}) =>
    shallow(
      <ListPage
        canModify={true}
        hasSubaccounts={false}
        isDeletePending={false}
        showAlert={jest.fn()}
        listTemplates={jest.fn()}
        loading={false}
        templates={[
          {
            published: true,
            id: 'id1',
            name: 'subaccount template',
            last_update_time: '2017-08-10T14:15:16+00:00',
            subaccount_id: 101,
            shared_with_subaccounts: false,
          },
          {
            published: false,
            id: 'id2',
            name: 'shared template',
            last_update_time: '2017-08-10T14:15:16+00:00',
            shared_with_subaccounts: true,
          },
          {
            published: false,
            id: 'id3',
            name: 'master template',
            last_update_time: '2017-08-10T14:15:16+00:00',
          },
        ]}
        {...props}
      />,
    );

  it('loads templates on load', () => {
    const listTemplates = jest.fn();
    subject({ listTemplates });
    expect(listTemplates).toHaveBeenCalled();
  });

  it('renders without primary action for read-only users', () => {
    const wrapper = subject({ canModify: false });
    expect(wrapper).toHaveProp('primaryAction', undefined);
  });

  it('renders empty state', () => {
    const wrapper = subject({ templates: [] });
    expect(wrapper).toHaveProp('empty', expect.objectContaining({ show: true }));
  });

  it('renders Loading', () => {
    const wrapper = subject({ loading: true });
    expect(wrapper.find('Loading')).toExist();
  });

  it('renders delete modal visible', () => {
    const wrapper = subject();
    wrapper.setState({ showDeleteModal: true });
    expect(wrapper.find('DeleteTemplateModal').prop('open')).toBe(true);
  });

  it('renders delete modal hidden', () => {
    const wrapper = subject();
    wrapper.setState({ showDeleteModal: false });
    expect(wrapper.find('DeleteTemplateModal').prop('open')).toBe(false);
  });

  it('deletes template upon confirmation', async () => {
    const delFn = jest.fn(() => Promise.resolve());
    const wrapper = subject({ deleteTemplate: delFn });
    wrapper.setState({
      showDeleteModal: true,
      templateToDelete: { id: 'foo', name: 'Bar', subaccount_id: 123 },
    });
    await wrapper.find('DeleteTemplateModal').prop('deleteTemplate')();
    expect(delFn).toHaveBeenCalled();
  });

  it('shows alert after delete and refreshes list', async () => {
    const alertFn = jest.fn();
    const listTemplateFn = jest.fn();
    const wrapper = subject({
      showAlert: alertFn,
      listTemplates: listTemplateFn,
    });
    wrapper.setState({ showDeleteModal: true, templateToDelete: { id: 'foo', name: 'Bar' } });
    await wrapper.find('DeleteTemplateModal').prop('successCallback')();
    expect(alertFn).toHaveBeenCalledWith({ type: 'success', message: 'Template Bar deleted' });
    expect(listTemplateFn).toHaveBeenCalled();
  });

  it('invokes `getPublished()` when the template is in published mode when toggling the duplicate modal', () => {
    const mockGetPublished = jest.fn(() => Promise.resolve({ id: 'foo' }));
    const wrapper = subject({
      getPublished: mockGetPublished,
      getTestData: jest.fn(),
    });

    wrapper.instance().toggleDuplicateModal({ published: true, id: 'foo', subaccount_id: 'bar' });
    expect(mockGetPublished).toHaveBeenCalledWith('foo', 'bar');
  });

  it('invokes `getDraft()` when the template is NOT in published mode when toggling the duplicate modal', () => {
    const mockGetDraft = jest.fn(() => Promise.resolve({ id: 'foo' }));
    const wrapper = subject({
      getDraft: mockGetDraft,
      getTestData: jest.fn(),
    });

    wrapper.instance().toggleDuplicateModal({ published: false, id: 'foo', subaccount_id: 'bar' });
    expect(mockGetDraft).toHaveBeenCalledWith('foo', 'bar');
  });

  it('shows an alert after duplication and refreshes the list', async () => {
    const mockShowAlert = jest.fn();
    const mockListTemplates = jest.fn();
    const wrapper = subject({
      showAlert: mockShowAlert,
      listTemplates: mockListTemplates,
    });
    wrapper.setState({
      templateToDuplicate: {
        name: 'Hello',
      },
    });

    await wrapper.find('DuplicateTemplateModal').prop('successCallback')();

    expect(mockShowAlert).toHaveBeenCalledWith({
      type: 'success',
      message: 'Template Hello duplicated',
    });
    expect(mockListTemplates).toHaveBeenCalled();
  });

  it('does not render column with canModify false', () => {
    const wrapper = subject({ canModify: false });
    const headers = wrapper
      .find('TableCollection')
      .prop('columns')
      .map(({ label }) => label);
    expect(headers).toEqual(['Template Name', 'Status', 'Last Updated']);
  });

  describe('renders error banner', () => {
    it('with error details', () => {
      const wrapper = subject({ error: new Error('Oh no!'), templates: [] });
      expect(wrapper.find('ApiErrorBanner')).toHaveProp('errorDetails', 'Oh no!');
    });

    it('with reload button', () => {
      const listTemplates = jest.fn();
      const wrapper = subject({
        error: new Error('Oh no!'),
        listTemplates,
        templates: [],
      });

      expect(wrapper.find('ApiErrorBanner')).toHaveProp('reload', listTemplates);
    });
  });
});
