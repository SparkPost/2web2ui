import { shallow } from 'enzyme';
import React from 'react';
import { RedirectAndAlert } from 'src/components/globalAlert';
import { DetailsPageComponent as DetailsPage } from '../DetailsPage';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TestApp from 'src/__testHelpers__/TestApp';

describe('Page: Alert Details', () => {
  const props = {
    getAlert: jest.fn(),
    getIncidents: jest.fn(),
    deleteAlert: jest.fn(() => Promise.resolve()),
    showUIAlert: jest.fn(),
    hasSubaccounts: true,
    listSubaccounts: jest.fn(() => Promise.resolve()),
    subaccounts: [{ id: 1, name: 'My Subaccount' }],
    alert: { name: 'My Alert' },
    incidents: [],
    loading: false,
    id: 'alert-id',
    deletePending: false,
    history: { push: jest.fn() },
    isHibanaEnabled: false,
  };

  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<DetailsPage {...props} />);
  });

  it('should get subaccounts on mount', () => {
    wrapper = shallow(<DetailsPage {...props} />);
    expect(props.listSubaccounts).toHaveBeenCalled();
  });

  it('should attempt to load incidents', () => {
    wrapper = shallow(<DetailsPage {...props} />);
    expect(props.getIncidents).toHaveBeenCalledWith({ id: 'alert-id' });
  });

  it('should render loading component when loading data', () => {
    wrapper.setProps({ loading: true });
    expect(wrapper.find('Loading')).toHaveLength(1);
    expect(wrapper.find('Page')).not.toExist();
  });

  it('should redirect to List page if fails to load', () => {
    wrapper.setProps({ error: { message: 'this failed' } });
    expect(wrapper.find(RedirectAndAlert)).toHaveLength(1);
    expect(wrapper.find('Page')).not.toExist();
  });

  it('should handle subaccount id to String', () => {
    const subaccountIdToString = wrapper.instance().subaccountIdToString;
    expect(subaccountIdToString(1)).toEqual('My Subaccount (1)');
    expect(subaccountIdToString(0)).toEqual('Primary account');
  });

  it('should toggle delete modal upon clicking delete Button', () => {
    const { queryByText } = render(
      <TestApp>
        <DetailsPage {...props} />
      </TestApp>,
    );

    expect(queryByText('Are you sure you want to delete this alert?')).not.toBeInTheDocument();
    userEvent.click(queryByText('Delete'));
    expect(queryByText('Are you sure you want to delete this alert?')).toBeInTheDocument();
  });

  it('should handle delete', async () => {
    await wrapper.instance().handleDelete();
    expect(props.deleteAlert).toHaveBeenCalledWith({ id: 'alert-id' });
    expect(props.showUIAlert).toHaveBeenCalled();
  });

  it('should not display alert incidents for blocklist alerts', () => {
    wrapper.setProps({ alert: { name: 'My Blocklist Alert', metric: 'blocklist' } });
    expect(wrapper.find('AlertIncidents')).not.toExist();
  });
});
