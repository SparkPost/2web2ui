import React from 'react';
import { shallow } from 'enzyme';
import useEditorContext from '../../hooks/useEditorContext';
import useHibanaOverride from 'src/hooks/useHibanaOverride';
import EditNavigation from '../EditNavigation';
import styles from '../EditNavigation.module.scss';

jest.mock('../../hooks/useEditorContext');
jest.mock('src/hooks/useHibanaOverride');

describe('EditNavigation', () => {
  const subject = ({ editorState, ...props } = {}) => {
    useHibanaOverride.mockImplementationOnce(() => styles);
    useEditorContext.mockReturnValue({
      currentNavigationKey: 'contents',
      ...editorState,
    });

    return shallow(<EditNavigation primaryArea={<button>Click Me</button>} {...props} />);
  };

  it('calls setNavigation when link is clicked', () => {
    const setNavigation = jest.fn();
    const wrapper = subject({ editorState: { setNavigation } });

    wrapper
      .find('ButtonLink')
      .filterWhere(node => node.children().text() === 'Template Settings')
      .simulate('click');

    expect(setNavigation).toHaveBeenCalledWith('settings');
  });

  it('renders a "Saved" when the editor state `hasSaved` is `true`', () => {
    const wrapper = subject({ editorState: { hasSaved: true } });

    expect(wrapper.find('SavedIndicator')).toHaveProp('hasSaved', true);
  });

  it('renders "Unsaved Changes" when the editor state `hasSaved` is `false`', () => {
    const wrapper = subject({ editorState: { hasSaved: false } });

    expect(wrapper.find('SavedIndicator')).toHaveProp('hasSaved', false);
  });
});
