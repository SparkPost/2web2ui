import React from 'react';
import { shallow } from 'enzyme';

/**
 * Shallow renders a component for React's context api
 * @example
 *   const consumer = context(<Button {...props}/>, { ...defaultContext });
 *   consumer.component.instance().doInstanceMethod();
 *   expect(consumer.children({ ...newContext })).toMatchSnapshot();
 */

export default function context(Component, context) {
  const component = shallow(Component);
  const ChildrenFunc = component.props().children;
  const children = newContext => shallow(<ChildrenFunc {...context} {...newContext} />);
  return { component, children };
}
