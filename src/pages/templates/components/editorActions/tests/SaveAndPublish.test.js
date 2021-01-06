import React from 'react';
import { shallow } from 'enzyme';
import SaveAndPublish from '../SaveAndPublish';
import useEditorContext from '../../../hooks/useEditorContext';

jest.mock('../../../hooks/useEditorContext');

describe('SaveAndPublish', () => {
  const subject = (editorState, children = null, props) => {
    useEditorContext.mockReturnValue({
      draft: { id: 'foo' },
      history: { push: jest.fn() },
      ...editorState,
    });

    return shallow(
      <SaveAndPublish className="Foo" {...props}>
        {children}
      </SaveAndPublish>,
    );
  };

  it('renders SaveAndPublish action', () => {
    expect(subject()).toMatchSnapshot();
  });

  it('renders SaveAndPublish action with provided children', () => {
    expect(subject(null, <span>Click here</span>).find('Button')).toExist();
  });

  it('Renders and icon and default content when no children are supplied', () => {
    const wrapper = shallow(<SaveAndPublish />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders confirmation modal upon clicking', () => {
    const mockFn = jest.fn();
    const wrapper = subject(undefined, null, { onClick: mockFn });

    wrapper.find('ButtonLink').simulate('click');

    expect(mockFn).toHaveBeenCalled();
  });
});
