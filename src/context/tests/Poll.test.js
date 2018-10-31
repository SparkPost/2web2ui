import React from 'react';
import Poll from '../Poll';
import { shallow } from 'enzyme';
import delay from 'src/__testHelpers__/delay';
import { fn as mockMoment } from 'moment';

describe('Poll Provider', () => {
  let wrapper;

  const testAction = {
    key: 'testAction',
    action: jest.fn(),
    interval: 100,
    duration: 200
  };

  beforeEach(() => {
    wrapper = shallow(<Poll>child</Poll>);
    Date.now = jest.fn(() => 1487076708000); // moment() uses Date.now
    mockMoment.diff = jest.fn().mockReturnValue(0);
  });

  afterAll(() => {
    mockMoment.format.mockReset();
  });

  it('should render children with the correct state', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should start and finish polling', async () => {
    const { startPolling } = wrapper.props().value;
    startPolling(testAction);

    // Check polling state
    expect(wrapper.props().value.actions.testAction).toMatchSnapshot();

    // Simulate duration has reached
    mockMoment.diff = jest.fn().mockReturnValue(200);
    await delay(200);

    // Check done state
    expect(wrapper.props().value.actions.testAction.status).toBe('done');
  });

  it('should start and stop polling when stopPolling is invoked', async () => {
    const { startPolling, stopPolling } = wrapper.props().value;
    startPolling(testAction);

    expect(wrapper.props().value.actions.testAction.status).toBe('polling');
    stopPolling(testAction.key);
    expect(wrapper.props().value.actions.testAction.status).toBe('stopped');
  });
});
