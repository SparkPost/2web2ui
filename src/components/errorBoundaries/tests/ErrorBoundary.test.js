import { shallow } from 'enzyme';
import React from 'react';
import { EmptyState } from '@sparkpost/matchbox';
import ErrorBoundary from '../ErrorBoundary';
import ErrorTracker from 'src/helpers/errorTracker';

jest.mock('src/helpers/errorTracker');

describe('Component: ErrorBoundary', () => {
  let wrapper;
  let props;

  beforeEach(() => {
    props = {
      showAction: false,
      children: jest.fn()
    };

    wrapper = shallow(<ErrorBoundary {...props}><div>Children</div></ErrorBoundary>);
  });

  it('renders (children) correctly without error', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with error', () => {
    wrapper.setState({ hasError: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('.componentDidCatch sets error state and reports the error', () => {
    const error = new Error('Oh no!');

    wrapper.instance().componentDidCatch(error);

    expect(wrapper.state('hasError')).toEqual(true);
    expect(ErrorTracker.report).toHaveBeenCalledWith('error-boundary', error);
  });

  it('renders custom cta label when passed', () => {
    wrapper.setProps({ ctaLabel: 'To Safety' });
    wrapper.setState({ hasError: true });
    expect(wrapper).toMatchSnapshot();
  });

  it('uses custom action when passed', () => {
    const mockFn = jest.fn();
    wrapper.setProps({ ctaLabel: 'Reload Page', onCtaClick: mockFn });
    wrapper.setState({ hasError: true });
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(EmptyState).prop('primaryAction').onClick).toBe(mockFn);
  });
});
