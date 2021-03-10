import React from 'react';
import { shallow } from 'enzyme';
import { Typeahead } from '../Typeahead';

jest.mock('lodash/debounce', () =>
  jest.fn(fn => {
    fn.cancel = jest.fn();
    return fn;
  }),
);

describe('Component: Typeahead', () => {
  let props;
  let wrapper;
  let downshiftHelpers;
  const defaultCrossMatches = [
    { type: 'Sending Domain', value: 'cross' },
    { type: 'Template', value: 'crossing' },
  ];

  beforeEach(() => {
    props = {
      items: [
        { type: 'Sending Domain', value: 'cross' },
        { type: 'Campaign', value: 'treasure' },
        { type: 'Recipient Domain', value: 'cross.example.com' },
        { type: 'Template', value: 'crossing' },
      ],
      matches: [],
      onSelect: jest.fn(),
      refreshTypeaheadCache: jest.fn(() => Promise.resolve()),
      placeholder: '',
      pattern: null,
    };

    downshiftHelpers = {
      getInputProps: jest.fn(),
      getItemProps: jest.fn(),
      getLabelProps: jest.fn(),
      isOpen: true,
      selectedItem: null,
      highlightedIndex: 0,
      clearSelection: jest.fn(),
    };

    wrapper = shallow(<Typeahead {...props} />);
  });

  function renderTypeahead(wrapper, input) {
    const TypeaheadRender = wrapper.instance().onTypeahead;
    return shallow(<TypeaheadRender {...downshiftHelpers} inputValue={input} {...props} />);
  }

  it('should render ok by default', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should trigger on field change', () => {
    wrapper.simulate('inputValueChange', 'cros');
    expect(props.refreshTypeaheadCache).toHaveBeenCalledTimes(1);
  });

  it('should produce matches on search', () => {
    wrapper.simulate('inputValueChange', 'cross');
    expect(wrapper.state().matches).toEqual(defaultCrossMatches);
  });

  it('should produce no matches on empty query', () => {
    wrapper.simulate('inputValueChange', '');
    expect(wrapper.state().matches).toEqual([]);
  });

  it('should first show synchronous matches while waiting for async calls to finish', () => {
    const input = 'cross';
    wrapper.simulate('inputValueChange', input);
    expect(wrapper.state().calculatingMatches).toEqual(true);
    expect(renderTypeahead(wrapper, input)).toMatchSnapshot();
  });

  it('should not make any api requests nor have any matches with a pattern <2 characters', () => {
    const input = 'c';
    return wrapper
      .instance()
      .updateLookAhead(input)
      .then(() => {
        expect(props.refreshTypeaheadCache).not.toHaveBeenCalled();
        expect(renderTypeahead(wrapper, input)).toMatchSnapshot();
      });
  });

  it('should show sync and async matches', () => {
    const input = 'cross';
    return wrapper
      .instance()
      .updateLookAhead(input)
      .then(() => {
        expect(renderTypeahead(wrapper, input)).toMatchSnapshot();
      });
  });

  it('should not update matches on receiving out-of-date results', () => {
    const input = 'cros';
    const promise = wrapper.instance().updateLookAhead(input);
    wrapper.instance().setState({ pattern: 'something else' });
    return promise.then(() => {
      expect(wrapper.state().matches).toEqual(defaultCrossMatches);
    });
  });

  it('should call onSelect on change', () => {
    const value = { type: 'Template', value: 'treasure' };
    wrapper.instance().handleDownshiftChange(value);
    expect(props.onSelect).toHaveBeenCalledWith(value);
  });

  it('should not call onSelect on clear', () => {
    wrapper.instance().handleDownshiftChange(null);
    expect(props.onSelect).not.toHaveBeenCalled();
  });

  it('should cancel any debounced lookahead updates', () => {
    const cancel = jest.spyOn(wrapper.instance().updateLookAhead, 'cancel');
    wrapper.unmount();
    expect(cancel).toHaveBeenCalled();
  });
});
