import React from 'react';
import { mount } from 'enzyme';
import TestApp from 'src/__testHelpers__/TestApp';
import SavedIndicator from '../SavedIndicator';

describe.skip('SavedIndicator', () => {
  it('renders with the content "Template Saved" when the `hasSaved` prop is `true`', () => {
    const wrapper = mount(
      <TestApp>
        <SavedIndicator hasSaved />
      </TestApp>,
    );

    expect(wrapper.text()).toBe('Template Saved');
  });

  it('renders with the content "Template has Unsaved Changes" when the `hasSaved` prop is `false`', () => {
    const wrapper = mount(
      <TestApp>
        <SavedIndicator hasSaved={false} />
      </TestApp>,
    );

    expect(wrapper.text()).toBe('Template has Unsaved Changes');
  });
});
