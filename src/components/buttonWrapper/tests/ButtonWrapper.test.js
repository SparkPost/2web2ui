import React from 'react';
import { mount } from 'enzyme';
import ButtonWrapper from '../ButtonWrapper';
import TestApp from 'src/__testHelpers__/TestApp';

describe('ButtonWrapper: ', () => {
  const subject = (func = mount) =>
    func(
      <TestApp>
        <ButtonWrapper>Children...</ButtonWrapper>
      </TestApp>,
    );
  it('should render correctly', () => {
    expect(subject()).toHaveTextContent('Children...');
  });
});
