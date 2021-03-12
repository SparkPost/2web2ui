import React from 'react';
import { shallow } from 'enzyme';
import FieldSet from '../FieldSet';

describe('FieldSet', () => {
  const subject = props =>
    shallow(
      <FieldSet legend="Examples" {...props}>
        <input name="example_a" type="text" />
        <input name="example_b" type="text" />
      </FieldSet>,
    );

  it('renders fieldset with legend', () => {
    const wrapper = subject();
    expect(wrapper).toHaveDisplayName('fieldset');
    expect(wrapper).toHaveTextContent('Examples');
  });

  it('hides legend', () => {
    const wrapper = subject({ legendHidden: true });
    expect(wrapper.find('ScreenReaderOnly')).toHaveProp('as', 'legend');
    expect(wrapper).toHaveTextContent('Examples');
  });
});
