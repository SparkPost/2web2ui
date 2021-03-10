import React from 'react';
import { shallow } from 'enzyme';
import MetricsModal from '../MetricsModal';
import { Checkbox } from 'src/components/matchbox';

// this uses the src/config/__mocks__/metrics.js file automatically
jest.mock('src/config/metrics');

describe('Component: Summary Chart Metrics Modal', () => {
  let props;
  let wrapper;

  beforeEach(() => {
    props = {
      open: true,
      onCancel: jest.fn(),
      onSubmit: jest.fn(),
      selectedMetrics: [],
    };
    wrapper = shallow(<MetricsModal {...props} />);
  });

  it('should render', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should select metrics', () => {
    const checkboxes = wrapper.find(Checkbox);
    checkboxes.at(1).simulate('change');
    checkboxes.at(3).simulate('change');

    expect(wrapper).toMatchSnapshot();
  });

  it('should disable checkboxes when max selected', () => {
    const checkboxes = wrapper.find(Checkbox);
    wrapper.setProps({ maxMetrics: 2 });

    checkboxes.at(1).simulate('change');
    checkboxes.at(3).simulate('change');

    expect(wrapper).toMatchSnapshot();
  });

  it('should handle submit', () => {
    const checkboxes = wrapper.find(Checkbox);
    const instance = wrapper.instance();

    checkboxes.at(1).simulate('change');
    checkboxes.at(3).simulate('change');

    instance.handleKeyDown({ key: 'Enter' });

    expect(props.onSubmit).toHaveBeenCalledWith(['count_injected', 'count_targeted']);
  });

  it('should do nothing on key events if not open 🤔', () => {
    const checkboxes = wrapper.find(Checkbox);
    const instance = wrapper.instance();

    checkboxes.at(1).simulate('change');
    checkboxes.at(3).simulate('change');

    wrapper.setProps({ open: false });
    instance.handleKeyDown({ key: 'Enter' });
    instance.handleKeyDown({ key: 'Escape' });

    expect(props.onSubmit).not.toHaveBeenCalled();
    expect(props.onCancel).not.toHaveBeenCalled();
  });
});
