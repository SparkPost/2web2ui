import React from 'react';
import { shallow } from 'enzyme';
import Page from '../Page';
import { useHibana } from 'src/context/HibanaContext';
jest.mock('src/context/HibanaContext');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ location: '' }),
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));
describe('Page Matchbox component wrapper', () => {
  const defaultProps = {
    onRemove: () => jest.fn(),
  };
  const systemProps = {
    my: '100',
  };
  const mergedProps = { ...systemProps, ...defaultProps };
  const subject = props => {
    return shallow(
      <Page {...mergedProps} {...props}>
        Children...
      </Page>,
    );
  };
  it('renders the HibanaPage component correctly when hibana is enabled', () => {
    useHibana.mockImplementationOnce(() => [{ isHibanaEnabled: true }]);
    const wrapper = subject();
    expect(wrapper.find('HibanaPage')).toExist();
    expect(wrapper.find('OGPage')).not.toExist();
    Object.keys(mergedProps).forEach(key => {
      expect(wrapper.find('HibanaPage')).toHaveProp(key, mergedProps[key]);
    });
    expect(wrapper).toHaveTextContent('Children...');
  });
  it('renders the OGPage component correctly when hibana is not enabled', () => {
    useHibana.mockImplementationOnce(() => [{ isHibanaEnabled: false }]);
    const wrapper = subject();
    expect(wrapper.find('OGPage')).toExist();
    expect(wrapper.find('HibanaPage')).not.toExist();
    Object.keys(defaultProps).forEach(key => {
      expect(wrapper.find('OGPage')).toHaveProp(key, mergedProps[key]);
    });
    Object.keys(systemProps).forEach(key => {
      expect(wrapper.find('OGPage')).not.toHaveProp(key, mergedProps[key]);
    });
    expect(wrapper).toHaveTextContent('Children...');
  });

  it('renders the Loading component when loading prop is set', () => {
    useHibana.mockImplementationOnce(() => [{ isHibanaEnabled: false }]);
    const wrapper = subject({ loading: true });
    expect(wrapper.find('OGPage')).not.toExist();
    expect(wrapper.find('HibanaPage')).not.toExist();
    expect(wrapper.find('Loading')).toExist();
  });

  it('renders the Hibana EmptyState component when hibana is set', () => {
    useHibana.mockImplementationOnce(() => [{ isHibanaEnabled: true }]);
    const wrapper = subject({
      empty: { show: true },
      hibanaEmptyStateComponent: EmptyState,
    });
    expect(wrapper.find('OGPage')).not.toExist();
    expect(wrapper.find('HibanaPage')).not.toExist();
    expect(wrapper.find('EmptyState')).toExist();
  });
});

function EmptyState() {
  return <div>EmptyState...</div>;
}
