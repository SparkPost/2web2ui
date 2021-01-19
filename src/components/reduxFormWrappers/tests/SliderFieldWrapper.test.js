import React from 'react';
import { mount, shallow } from 'enzyme';
import SliderFieldWrapper, {
  HibanaSliderFieldWrapper,
  OGSliderFieldWrapper,
} from '../SliderFieldWrapper';
import TestApp from 'src/__testHelpers__/TestApp';
import { Slider, TextField } from 'src/components/matchbox';

describe('SliderFieldWrapper', () => {
  const subject = ({ input, ...props } = {}) =>
    mount(
      <TestApp>
        <SliderFieldWrapper
          id="testSlider"
          input={{ onChange: () => {}, ...input }}
          label="Test Slider"
          {...props}
        />
      </TestApp>,
    );

  it('renders with a label', () => {
    expect(subject()).toHaveTextContent('Test Slider');
  });

  it('renders disabled slider and text field', () => {
    const wrapper = subject({ disabled: true });

    expect(wrapper.find(Slider)).toHaveProp('disabled', true);
    expect(wrapper.find(TextField)).toHaveProp('disabled', true);
  });

  it('cleans, clamps, reports, and updates value on blur', () => {
    const onChange = jest.fn();
    const wrapper = subject({ input: { onChange, value: 50 }, precision: 1 });

    wrapper.find(TextField).prop('onBlur')({ target: { value: 55.55555 } });
    wrapper.update(); // because simulate didn't work

    expect(onChange).toHaveBeenCalledWith(55.6);
    expect(wrapper.find(TextField)).toHaveValue(55.6);
  });

  it('rerenders with raw input value', () => {
    const wrapper = subject();
    const invalidValue = 666;

    wrapper.find(TextField).prop('onChange')({ target: { value: invalidValue } });
    wrapper.update(); // because simulate didn't work
    expect(wrapper.find(Slider)).toHaveValue(undefined);
    expect(wrapper.find(TextField)).toHaveValue(invalidValue);
  });

  it.skip('updates internal state value based on prop change', () => {
    const testWrapper = wrap => {
      expect(wrap.find(Slider)).toHaveValue(45);
      expect(wrap.find(TextField)).toHaveValue(45);

      wrap.setProps({ input: { value: 79 } });
      wrapper.update();

      expect(wrap.find(Slider)).toHaveValue(79);
      expect(wrap.find(TextField)).toHaveValue(79);
    };

    const wrapper = shallow(<OGSliderFieldWrapper input={{ value: 45 }} />);
    const hibanaWrapper = shallow(<HibanaSliderFieldWrapper input={{ value: 45 }} />);
    testWrapper(wrapper);
    testWrapper(hibanaWrapper);
  });
});
